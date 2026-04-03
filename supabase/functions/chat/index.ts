import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * OpenClaw WebSocket handler with improved event registration.
 * Registers all event handlers BEFORE the connection opens to avoid missing messages.
 */
async function handleOpenClaw(
  baseUrl: string,
  apiKey: string,
  messages: any[],
  userId: string,
): Promise<Response> {
  // Ensure ws(s) protocol
  let wsUrl = baseUrl.replace(/\/+$/, "");
  if (wsUrl.startsWith("http://")) wsUrl = wsUrl.replace("http://", "ws://");
  else if (wsUrl.startsWith("https://")) wsUrl = wsUrl.replace("https://", "wss://");
  if (!wsUrl.startsWith("ws://") && !wsUrl.startsWith("wss://")) {
    wsUrl = `wss://${wsUrl}`;
  }

  const sessionId = `user_${userId}_${Date.now()}`;
  const wsEndpoint = `${wsUrl}/ws/${sessionId}`;

  console.log(`[openclaw] connecting to ${wsEndpoint}`);

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const writeSSE = async (data: string) => {
    try {
      await writer.write(encoder.encode(`data: ${data}\n\n`));
    } catch { /* stream closed */ }
  };

  // Extract the last user message
  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
  const userContent = lastUserMsg?.content || "";

  // Launch WS in background
  (async () => {
    let done = false;
    let ws: WebSocket | null = null;

    const finalize = async () => {
      if (done) return;
      done = true;
      try {
        await writeSSE(JSON.stringify({
          choices: [{ delta: {}, index: 0, finish_reason: "stop" }],
        }));
        await writeSSE("[DONE]");
      } catch { /* ignore */ }
      try { await writer.close(); } catch { /* ignore */ }
    };

    try {
      ws = new WebSocket(wsEndpoint);

      // Register ALL handlers immediately, before open
      ws.onmessage = async (event) => {
        try {
          const raw = typeof event.data === "string" ? event.data : "";
          console.log(`[openclaw] raw msg: ${raw.slice(0, 300)}`);

          const data = JSON.parse(raw);

          if (data.type === "token" || data.type === "chunk") {
            const content = data.content || data.token || data.text || "";
            if (content) {
              await writeSSE(JSON.stringify({
                choices: [{ delta: { content }, index: 0, finish_reason: null }],
              }));
            }
          } else if (data.type === "done" || data.type === "end" || data.type === "complete") {
            await finalize();
            ws?.close();
          } else if (data.type === "error") {
            await writeSSE(JSON.stringify({
              choices: [{ delta: { content: `\n\n[错误] ${data.message || "OpenClaw 返回错误"}` }, index: 0, finish_reason: null }],
            }));
            await finalize();
            ws?.close();
          } else if (data.type === "message" && data.content) {
            // Full message in one event
            await writeSSE(JSON.stringify({
              choices: [{ delta: { content: data.content }, index: 0, finish_reason: null }],
            }));
            await finalize();
            ws?.close();
          } else if (data.type === "response" && (data.content || data.text || data.message)) {
            const content = data.content || data.text || (typeof data.message === "string" ? data.message : "");
            if (content) {
              await writeSSE(JSON.stringify({
                choices: [{ delta: { content }, index: 0, finish_reason: null }],
              }));
            }
            await finalize();
            ws?.close();
          } else {
            console.log(`[openclaw] ignoring event type: ${data.type}`);
          }
        } catch (parseErr) {
          // Not JSON — treat as plain text content
          const text = typeof event.data === "string" ? event.data : "";
          if (text && text.trim()) {
            console.log(`[openclaw] non-JSON msg, treating as text: ${text.slice(0, 100)}`);
            await writeSSE(JSON.stringify({
              choices: [{ delta: { content: text }, index: 0, finish_reason: null }],
            }));
          }
        }
      };

      ws.onerror = async (e) => {
        console.error(`[openclaw] ws error:`, e);
        if (!done) {
          await writeSSE(JSON.stringify({
            choices: [{ delta: { content: "\n\n[连接错误] WebSocket 异常" }, index: 0, finish_reason: null }],
          }));
          await finalize();
        }
      };

      ws.onclose = async (e) => {
        console.log(`[openclaw] ws closed code=${e.code} reason=${e.reason} wasClean=${e.wasClean}`);
        if (!done) {
          await finalize();
        }
      };

      // Wait for open
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("WebSocket 连接超时 (15s)")), 15000);
        ws!.onopen = () => {
          clearTimeout(timeout);
          console.log(`[openclaw] connected, session=${sessionId}`);
          resolve();
        };
        // If onerror fires before onopen
        const origErr = ws!.onerror;
        ws!.onerror = (e) => {
          clearTimeout(timeout);
          origErr?.(e);
          reject(new Error("WebSocket connection failed"));
        };
      });

      // Re-register onerror after open (the open promise may have overridden it)
      ws.onerror = async (e) => {
        console.error(`[openclaw] ws error after open:`, e);
        if (!done) {
          await writeSSE(JSON.stringify({
            choices: [{ delta: { content: "\n\n[连接错误] WebSocket 异常" }, index: 0, finish_reason: null }],
          }));
          await finalize();
        }
      };

      // Send auth if api_key is set
      if (apiKey) {
        const authMsg = JSON.stringify({ type: "auth", token: apiKey });
        console.log(`[openclaw] sending auth`);
        ws.send(authMsg);
        await new Promise(r => setTimeout(r, 500));
      }

      // Send chat message
      const chatMsg = JSON.stringify({
        type: "chat",
        message: userContent,
        session_id: sessionId,
      });
      console.log(`[openclaw] sending chat: ${userContent.slice(0, 100)}`);
      ws.send(chatMsg);

      // Wait for completion or timeout
      await new Promise<void>((resolve) => {
        const maxWait = setTimeout(() => {
          if (!done) {
            console.warn(`[openclaw] timeout (120s), closing`);
            ws?.close();
          }
          resolve();
        }, 120000);

        const check = setInterval(() => {
          if (done) {
            clearTimeout(maxWait);
            clearInterval(check);
            resolve();
          }
        }, 500);
      });

    } catch (err) {
      console.error(`[openclaw] error:`, err);
      const errMsg = err instanceof Error ? err.message : "OpenClaw 连接失败";
      try {
        await writeSSE(JSON.stringify({
          choices: [{ delta: { content: `\n\n[错误] ${errMsg}` }, index: 0, finish_reason: null }],
        }));
        await finalize();
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

    let userId = "anonymous";
    const authHeader = req.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.sub || "anonymous";
      } catch { /* ignore */ }
    }

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

    // --- OpenClaw: WebSocket ---
    if (providerType === "openclaw") {
      return await handleOpenClaw(baseUrl, apiKey, messages, userId);
    }

    // --- OpenAI-compatible: standard REST ---
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
