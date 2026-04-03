import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const sbUrl = Deno.env.get("SUPABASE_URL")!;
    const sbKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(sbUrl, sbKey);

    if (model_id) {
      // Explicit model_id: load from DB
      const { data: model } = await admin
        .from("llm_models")
        .select("model_name, base_url, api_key")
        .eq("id", model_id)
        .eq("enabled", true)
        .single();

      if (model) {
        modelName = model.model_name;
        if (model.base_url) baseUrl = model.base_url;
        if (model.api_key) apiKey = model.api_key;
      }
    } else if (!apiKey) {
      // No LOVABLE_API_KEY (local env): fallback to first enabled model in DB
      const { data: fallback } = await admin
        .from("llm_models")
        .select("model_name, base_url, api_key")
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
      if (fallback.base_url) baseUrl = fallback.base_url;
      if (fallback.api_key) apiKey = fallback.api_key;
    }

    console.log(`[chat] model=${modelName} baseUrl=${baseUrl} user=${userId}`);

    // Unified OpenAI-compatible call
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
