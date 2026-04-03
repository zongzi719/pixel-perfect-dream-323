import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * OpenClaw REST-first handler.
 * Tries HTTP POST (OpenAI-compatible) first, falls back to WebSocket.
 */
async function handleOpenClaw(
  baseUrl: string,
  apiKey: string,
  messages: any[],
  userId: string,
): Promise<Response> {
  // Convert ws(s) to http(s) for REST calls
  const httpUrl = baseUrl.replace(/\/+$/, "").replace(/^ws(s?):\/\//, "http$1://");
  if (!httpUrl.startsWith("http")) {
    return handleOpenClawRest(`https://${httpUrl}`, apiKey, messages);
  }
  return handleOpenClawRest(httpUrl, apiKey, messages);
}

/**
 * OpenClaw via REST (OpenAI-compatible /v1/chat/completions).
 */
async function handleOpenClawRest(
  httpUrl: string,
  apiKey: string,
  messages: any[],
): Promise<Response> {
  // Try multiple possible endpoints
  const endpoints = [
    `${httpUrl}/v1/chat/completions`,
    `${httpUrl}/chat/completions`,
    `${httpUrl}/chat`,
  ];

  let lastError: string = "";

  for (const endpoint of endpoints) {
    try {
      console.log(`[chat/openclaw-rest] trying POST ${endpoint}`);

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: messages.some((m: any) => m.role === "system")
            ? messages
            : [
                { role: "system", content: "你是AIYOU智能助手，一位专业、友好的AI顾问。你擅长商业分析、战略规划、产品设计等领域。请用中文回答，保持简洁有深度。" },
                ...messages,
              ],
          stream: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const body = await response.text();
        console.log(`[chat/openclaw-rest] ${endpoint} returned ${response.status}: ${body.slice(0, 200)}`);
        lastError = `${response.status}: ${body.slice(0, 100)}`;
        continue;
      }

      const contentType = response.headers.get("content-type") || "";
      console.log(`[chat/openclaw-rest] success! content-type=${contentType}`);

      // SSE stream — pass through directly
      if (contentType.includes("text/event-stream") || contentType.includes("stream")) {
        return new Response(response.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      // JSON response — wrap as SSE
      const body = await response.text();
      console.log(`[chat/openclaw-rest] got JSON response (${body.length} bytes)`);

      let content = "";
      try {
        const json = JSON.parse(body);
        // OpenAI format
        if (json.choices?.[0]?.message?.content) {
          content = json.choices[0].message.content;
        } else if (json.response) {
          content = json.response;
        } else if (json.content) {
          content = json.content;
        } else if (json.message) {
          content = typeof json.message === "string" ? json.message : JSON.stringify(json.message);
        } else {
          content = body;
        }
      } catch {
        content = body;
      }

      // Build SSE from the full response
      const encoder = new TextEncoder();
      const sseChunk = `data: ${JSON.stringify({
        choices: [{ delta: { content }, index: 0, finish_reason: null }],
      })}\n\ndata: ${JSON.stringify({
        choices: [{ delta: {}, index: 0, finish_reason: "stop" }],
      })}\n\ndata: [DONE]\n\n`;

      return new Response(encoder.encode(sseChunk), {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`[chat/openclaw-rest] ${endpoint} failed: ${msg}`);
      lastError = msg;
      continue;
    }
  }

  // All REST endpoints failed — return error
  console.error(`[chat/openclaw-rest] all endpoints failed. last error: ${lastError}`);
  const encoder = new TextEncoder();
  const errorSSE = `data: ${JSON.stringify({
    choices: [{ delta: { content: `\n\n[错误] OpenClaw REST 请求失败: ${lastError}` }, index: 0, finish_reason: null }],
  })}\n\ndata: [DONE]\n\n`;

  return new Response(encoder.encode(errorSSE), {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
  });
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
    let apiKey = Deno.env.get("LOVABLE_API_KEY") || "";
    let modelName = "google/gemini-3-flash-preview";
    let providerType = "openai_compatible";

    const sbUrl = Deno.env.get("SUPABASE_URL")!;
    const sbKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(sbUrl, sbKey);

    if (model_id) {
      const { data: model } = await admin
        .from("llm_models")
        .select("model_name, base_url, api_key, provider_type")
        .eq("id", model_id)
        .eq("enabled", true)
        .single();

      if (model) {
        modelName = model.model_name;
        providerType = model.provider_type || "openai_compatible";
        if (model.base_url) baseUrl = model.base_url;
        if (model.api_key) apiKey = model.api_key;
      }
    } else if (!apiKey) {
      const { data: fallback } = await admin
        .from("llm_models")
        .select("model_name, base_url, api_key, provider_type")
        .eq("enabled", true)
        .order("is_default", { ascending: false })
        .order("sort_order", { ascending: true })
        .limit(1)
        .single();

      if (!fallback) {
        return new Response(
          JSON.stringify({ error: "请先在管理后台配置至少一个启用的模型" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      modelName = fallback.model_name;
      providerType = fallback.provider_type || "openai_compatible";
      if (fallback.base_url) baseUrl = fallback.base_url;
      if (fallback.api_key) apiKey = fallback.api_key;
    }

    console.log(`[chat] provider=${providerType} model=${modelName} baseUrl=${baseUrl} user=${userId}`);

    // --- OpenClaw branch: REST-first ---
    if (providerType === "openclaw") {
      return await handleOpenClaw(baseUrl, apiKey, messages, userId);
    }

    // --- OpenAI-compatible branch: standard REST ---
    const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
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
