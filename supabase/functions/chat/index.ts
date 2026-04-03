import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function handleOpenClaw(baseUrl: string, apiKey: string, userId: string, message: string) {
  const sessionKey = `user-${userId}`;
  const url = `${baseUrl.replace(/\/+$/, '')}/api/sessions/${sessionKey}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const t = await response.text();
    console.error("OpenClaw error:", response.status, t);
    throw new Error(`OpenClaw error: ${response.status}`);
  }

  // OpenClaw returns a JSON response; convert to SSE stream for frontend compatibility
  const result = await response.json();
  const content = result?.response || result?.content || result?.message || JSON.stringify(result);

  // Build an SSE stream that matches OpenAI format
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send the content as a single chunk in OpenAI SSE format
      const chunk = {
        id: "openclaw-" + Date.now(),
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        choices: [{ index: 0, delta: { content }, finish_reason: null }],
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));

      // Send finish
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

    // Extract user ID from JWT for OpenClaw session key
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

    // OpenClaw route
    if (providerType === "openclaw") {
      const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
      const content = lastUserMsg?.content || "";
      const stream = await handleOpenClaw(baseUrl, apiKey, userId, content);
      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // OpenAI-compatible route (existing logic)
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
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
