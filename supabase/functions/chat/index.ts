import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * OpenClaw WebSocket-to-SSE bridge.
 * Connects via WS, sends chat, converts streamed tokens into SSE format.
 */
async function handleOpenClaw(
  baseUrl: string,
  apiKey: string,
  messages: any[],
  userId: string,
): Promise<Response> {
  // Convert http(s) to ws(s) if needed
  let wsUrl = baseUrl.replace(/\/+$/, "");
  if (wsUrl.startsWith("http://")) wsUrl = wsUrl.replace("http://", "ws://");
  else if (wsUrl.startsWith("https://")) wsUrl = wsUrl.replace("https://", "wss://");
  if (!wsUrl.startsWith("ws://") && !wsUrl.startsWith("wss://")) {
    wsUrl = `ws://${wsUrl}`;
  }

  const sessionId = `user_${userId}`;
  const wsEndpoint = `${wsUrl}/ws/${sessionId}`;

  console.log(`[chat/openclaw] connecting to ${wsEndpoint}`);

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const writeSSE = (data: string) => writer.write(encoder.encode(`data: ${data}\n\n`));

  // Launch WS communication in background
  (async () => {
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsEndpoint);

      // Wait for open
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("WebSocket connection timeout (15s)")), 15000);
        ws!.onopen = () => { clearTimeout(timeout); resolve(); };
        ws!.onerror = (e) => { clearTimeout(timeout); reject(e); };
      });

      console.log(`[chat/openclaw] connected, session=${sessionId}`);

      // If api_key is set, send auth
      if (apiKey) {
        ws.send(JSON.stringify({ type: "auth", token: apiKey }));
        // Wait briefly for auth ack (non-blocking, best-effort)
        await new Promise(r => setTimeout(r, 200));
      }

      // Extract the last user message
      const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
      const userContent = lastUserMsg?.content || "";

      // Send chat message
      ws.send(JSON.stringify({
        type: "chat",
        message: userContent,
        session_id: sessionId,
      }));

      // Collect streamed response
      let done = false;
      ws.onmessage = async (event) => {
        try {
          const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

          if (data.type === "token" || data.type === "chunk") {
            // Stream token as SSE in OpenAI-compatible format
            const ssePayload = JSON.stringify({
              choices: [{
                delta: { content: data.content || data.token || data.text || "" },
                index: 0,
                finish_reason: null,
              }],
            });
            await writeSSE(ssePayload);
          } else if (data.type === "done" || data.type === "end" || data.type === "complete") {
            const ssePayload = JSON.stringify({
              choices: [{ delta: {}, index: 0, finish_reason: "stop" }],
            });
            await writeSSE(ssePayload);
            await writeSSE("[DONE]");
            done = true;
            ws?.close();
          } else if (data.type === "error") {
            const ssePayload = JSON.stringify({
              choices: [{ delta: { content: `\n\n[错误] ${data.message || "OpenClaw 返回错误"}` }, index: 0, finish_reason: null }],
            });
            await writeSSE(ssePayload);
            await writeSSE("[DONE]");
            done = true;
            ws?.close();
          } else if (data.type === "message" && data.content) {
            // Some OpenClaw versions send full message as a single event
            const ssePayload = JSON.stringify({
              choices: [{
                delta: { content: data.content },
                index: 0,
                finish_reason: null,
              }],
            });
            await writeSSE(ssePayload);
            const endPayload = JSON.stringify({
              choices: [{ delta: {}, index: 0, finish_reason: "stop" }],
            });
            await writeSSE(endPayload);
            await writeSSE("[DONE]");
            done = true;
            ws?.close();
          }
          // Ignore other event types (ping, status, etc.)
        } catch (parseErr) {
          console.error("[chat/openclaw] parse error:", parseErr);
        }
      };

      ws.onerror = async (e) => {
        console.error("[chat/openclaw] ws error:", e);
        if (!done) {
          await writeSSE(JSON.stringify({
            choices: [{ delta: { content: "\n\n[连接错误] WebSocket 异常断开" }, index: 0, finish_reason: null }],
          }));
          await writeSSE("[DONE]");
          done = true;
        }
      };

      ws.onclose = async () => {
        console.log("[chat/openclaw] ws closed");
        if (!done) {
          // If closed without "done" event, finalize the stream
          await writeSSE(JSON.stringify({
            choices: [{ delta: {}, index: 0, finish_reason: "stop" }],
          }));
          await writeSSE("[DONE]");
        }
        try { await writer.close(); } catch { /* already closed */ }
      };

      // Keep alive — wait until writer is closed (driven by onclose above)
      // Use a timeout to prevent hanging forever
      await new Promise<void>((resolve) => {
        const maxWait = setTimeout(() => {
          if (!done) {
            console.warn("[chat/openclaw] max wait reached (120s), closing");
            ws?.close();
          }
          resolve();
        }, 120000);

        const checkInterval = setInterval(() => {
          if (done) {
            clearTimeout(maxWait);
            clearInterval(checkInterval);
            resolve();
          }
        }, 500);
      });

    } catch (err) {
      console.error("[chat/openclaw] error:", err);
      const errMsg = err instanceof Error ? err.message : "OpenClaw 连接失败";
      try {
        await writeSSE(JSON.stringify({
          choices: [{ delta: { content: `\n\n[错误] ${errMsg}` }, index: 0, finish_reason: null }],
        }));
        await writeSSE("[DONE]");
        await writer.close();
      } catch { /* ignore */ }
    }
  })();

  return new Response(readable, {
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
      // Explicit model_id: load from DB
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
      // No LOVABLE_API_KEY (local env): fallback to first enabled model in DB
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

    // --- OpenClaw branch: WebSocket-to-SSE bridge ---
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
