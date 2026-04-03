import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function handleOpenClaw(baseUrl: string, apiKey: string, userId: string, message: string) {
  const sessionKey = `user-${userId}`;
  const url = `${baseUrl.replace(/\/+$/, '')}/api/sessions/${sessionKey}/messages`;

  console.log(`[OpenClaw] POST ${url} | user=${userId}`);

  // 60s timeout for OpenClaw
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      console.error("[OpenClaw] Request timed out after 60s");
      throw new Error("OpenClaw 请求超时（60秒），请检查服务是否可达");
    }
    console.error("[OpenClaw] Connection error:", err.message);
    const msg = err.message || "";
    if (msg.includes("Connection refused")) {
      throw new Error("无法连接 OpenClaw 服务，请检查地址和端口是否正确");
    }
    if (msg.includes("timed out") || msg.includes("ETIMEDOUT")) {
      throw new Error("连接 OpenClaw 超时，请确认服务地址可从公网访问");
    }
    throw new Error(`OpenClaw 连接失败: ${msg}`);
  } finally {
    clearTimeout(timeoutId);
  }

  console.log(`[OpenClaw] Response status: ${response.status}`);

  if (!response.ok) {
    const t = await response.text().catch(() => "");
    console.error("[OpenClaw] Error response:", response.status, t);
    if (response.status === 401 || response.status === 403) {
      throw new Error("OpenClaw 认证失败，请检查 API Key / Bearer Token");
    }
    if (response.status === 404) {
      throw new Error("OpenClaw 接口未找到，请检查服务地址是否正确");
    }
    if (response.status >= 500) {
      throw new Error(`OpenClaw 服务内部错误 (${response.status})`);
    }
    throw new Error(`OpenClaw 返回错误: ${response.status}`);
  }

  const result = await response.json();
  const content = result?.response || result?.content || result?.message || JSON.stringify(result);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const chunk = {
        id: "openclaw-" + Date.now(),
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        choices: [{ index: 0, delta: { content }, finish_reason: null }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));

      const done = {
        id: "openclaw-" + Date.now(),
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(done)}\n\n`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return stream;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, model_id } = await req.json();

    // Extract user ID from JWT
    let userId = "anonymous";
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.sub || "anonymous";
      } catch { /* ignore */ }
    }

    // Determine model config
    let baseUrl = "https://ai.gateway.lovable.dev/v1";
    let apiKey = Deno.env.get("LOVABLE_API_KEY")!;
    let modelName = "google/gemini-3-flash-preview";
    let providerType = "openai_compatible";

    if (model_id) {
      const sbUrl = Deno.env.get("SUPABASE_URL")!;
      const sbKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const admin = createClient(sbUrl, sbKey);
      const { data: model } = await admin
        .from("llm_models")
        .select("model_name, base_url, api_key, provider_type")
        .eq("id", model_id)
        .eq("enabled", true)
        .single();

      if (model) {
        modelName = model.model_name;
        if (model.base_url) baseUrl = model.base_url;
        if (model.api_key) apiKey = model.api_key;
        if (model.provider_type) providerType = model.provider_type;
      }
    }

    console.log(`[chat] provider=${providerType} model=${modelName} baseUrl=${baseUrl} user=${userId}`);

    // OpenClaw route
    if (providerType === "openclaw") {
      const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
      const content = lastUserMsg?.content || "";
      const stream = await handleOpenClaw(baseUrl, apiKey, userId, content);
      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // OpenAI-compatible route
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages: messages.some((m: any) => m.role === "system")
          ? messages
          : [
              { role: "system", content: "你是AIYOU智能助手，一位专业、友好的AI顾问。你擅长商业分析、战略规划、产品设计等领域。请用中文回答，保持简洁有深度。" },
              ...messages,
            ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "请求过于频繁，请稍后再试" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI 额度已用完" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI 网关错误，请稍后再试" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    const errMsg = e instanceof Error ? e.message : "未知错误";
    return new Response(JSON.stringify({ error: errMsg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
