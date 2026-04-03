import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type OpenClawIdentity = {
  deviceId: string;
  publicKey: string;
  privateKey: CryptoKey;
};

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeOpenClawMetadata(value: string | undefined, fallback: string): string {
  const normalized = value?.trim().toLowerCase();
  return normalized || fallback;
}

function buildDeviceAuthPayloadV3(params: {
  deviceId: string;
  clientId: string;
  clientMode: string;
  role: string;
  scopes: string[];
  signedAtMs: number;
  token?: string | null;
  nonce: string;
  platform?: string;
  deviceFamily?: string;
}): string {
  return [
    "v3",
    params.deviceId,
    params.clientId,
    params.clientMode,
    params.role,
    params.scopes.join(","),
    String(params.signedAtMs),
    params.token ?? "",
    params.nonce,
    normalizeOpenClawMetadata(params.platform, "linux"),
    normalizeOpenClawMetadata(params.deviceFamily, "server"),
  ].join("|");
}

async function createOpenClawIdentity(): Promise<OpenClawIdentity> {
  const keyPair = await crypto.subtle.generateKey("Ed25519", true, ["sign", "verify"]) as CryptoKeyPair;
  const rawPublicKey = new Uint8Array(await crypto.subtle.exportKey("raw", keyPair.publicKey));
  const fingerprint = new Uint8Array(await crypto.subtle.digest("SHA-256", rawPublicKey));

  return {
    deviceId: bytesToHex(fingerprint),
    publicKey: base64UrlEncode(rawPublicKey),
    privateKey: keyPair.privateKey,
  };
}

async function signOpenClawPayload(privateKey: CryptoKey, payload: string): Promise<string> {
  const data = new TextEncoder().encode(payload);
  const signature = await crypto.subtle.sign("Ed25519", privateKey, data);
  return base64UrlEncode(new Uint8Array(signature));
}

function extractOpenClawText(message: unknown): string {
  if (!message || typeof message !== "object") return "";

  const value = message as Record<string, unknown>;
  if (typeof value.text === "string") return value.text;
  if (typeof value.content === "string") return value.content;

  if (Array.isArray(value.content)) {
    return value.content
      .map((part) => {
        if (typeof part === "string") return part;
        if (!part || typeof part !== "object") return "";

        const entry = part as Record<string, unknown>;
        return entry.type === "text" && typeof entry.text === "string" ? entry.text : "";
      })
      .join("");
  }

  return "";
}

function diffOpenClawText(previous: string, next: string): string {
  if (!next) return "";
  if (!previous) return next;
  if (next.startsWith(previous)) return next.slice(previous.length);
  return next === previous ? "" : next;
}

function getOpenClawErrorMessage(frame: any, fallback: string): string {
  const message = typeof frame?.error?.message === "string" ? frame.error.message : "";
  const code = typeof frame?.error?.details?.code === "string" ? frame.error.details.code : "";
  return [message, code].filter(Boolean).join(" (") + ([message, code].filter(Boolean).length > 1 ? ")" : "") || fallback;
}

/**
 * OpenClaw WebSocket handler.
 * Implements the official gateway flow: connect.challenge -> connect(req) -> chat.send(req).
 */
async function handleOpenClaw(
  baseUrl: string,
  apiKey: string,
  modelName: string,
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
  const sessionKey = modelName && modelName !== "openclaw" ? modelName : "agent:main:main";

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
    let challengeReceived = false;
    let connectRequestId: string | null = null;
    let chatRequestId: string | null = null;
    let chatSent = false;
    const emittedTextByRunId = new Map<string, string>();

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

    const sendAssistantDelta = async (content: string) => {
      if (!content) return;
      await writeSSE(JSON.stringify({
        choices: [{ delta: { content }, index: 0, finish_reason: null }],
      }));
    };

    try {
      ws = new WebSocket(wsEndpoint);

      ws.onmessage = async (event) => {
        try {
          const raw = typeof event.data === "string" ? event.data : "";
          console.log(`[openclaw] raw msg: ${raw.slice(0, 300)}`);
          if (!raw.trim()) return;

          const data = JSON.parse(raw);

          if (data.type === "event") {
            if (data.event === "connect.challenge") {
              if (connectRequestId) return;

              challengeReceived = true;
              const nonce = typeof data.payload?.nonce === "string" ? data.payload.nonce.trim() : "";
              if (!nonce) {
                await sendAssistantDelta("\n\n[错误] OpenClaw 未返回有效的 connect.challenge nonce");
                await finalize();
                ws?.close();
                return;
              }

              const role = "operator";
              const scopes = ["operator.read", "operator.write"];
              const clientId = "gateway-client";
              const clientMode = "backend";
              const platform = "linux";
              const deviceFamily = "server";
              const identity = await createOpenClawIdentity();
              const signedAtMs = Date.now();
              const signaturePayload = buildDeviceAuthPayloadV3({
                deviceId: identity.deviceId,
                clientId,
                clientMode,
                role,
                scopes,
                signedAtMs,
                token: apiKey || null,
                nonce,
                platform,
                deviceFamily,
              });
              const signature = await signOpenClawPayload(identity.privateKey, signaturePayload);

              connectRequestId = crypto.randomUUID();
              const connectFrame = {
                type: "req",
                id: connectRequestId,
                method: "connect",
                params: {
                  minProtocol: 3,
                  maxProtocol: 3,
                  client: {
                    id: clientId,
                    version: "1.0.0",
                    platform,
                    deviceFamily,
                    mode: clientMode,
                  },
                  role,
                  scopes,
                  caps: [],
                  auth: apiKey ? { token: apiKey } : undefined,
                  device: {
                    id: identity.deviceId,
                    publicKey: identity.publicKey,
                    signature,
                    signedAt: signedAtMs,
                    nonce,
                  },
                },
              };

              console.log(`[openclaw] sending connect for sessionKey=${sessionKey}`);
              ws?.send(JSON.stringify(connectFrame));
              return;
            }

            if (data.event === "chat") {
              const payload = data.payload && typeof data.payload === "object" ? data.payload : {};
              const eventSessionKey = typeof payload.sessionKey === "string" ? payload.sessionKey : "";
              if (eventSessionKey && eventSessionKey !== sessionKey) {
                console.log(`[openclaw] ignoring chat event for sessionKey=${eventSessionKey}`);
                return;
              }

              const state = typeof payload.state === "string" ? payload.state : "";
              const runId = typeof payload.runId === "string" ? payload.runId : "default";
              const fullText = extractOpenClawText(payload.message);
              const deltaText = typeof payload.delta === "string"
                ? payload.delta
                : diffOpenClawText(emittedTextByRunId.get(runId) || "", fullText);

              if (fullText) {
                emittedTextByRunId.set(runId, fullText);
              }

              if (deltaText) {
                await sendAssistantDelta(deltaText);
              }

              if (state === "final") {
                await finalize();
                ws?.close();
              } else if (state === "error") {
                const errorMessage = typeof payload.errorMessage === "string"
                  ? payload.errorMessage
                  : "OpenClaw 返回错误";
                await sendAssistantDelta(`\n\n[错误] ${errorMessage}`);
                await finalize();
                ws?.close();
              }
              return;
            }

            if (data.event !== "tick") {
              console.log(`[openclaw] ignoring event type: ${data.event}`);
            }
            return;
          }

          if (data.type === "res") {
            if (connectRequestId && data.id === connectRequestId) {
              if (!data.ok) {
                await sendAssistantDelta(`\n\n[错误] ${getOpenClawErrorMessage(data, "OpenClaw connect 失败")}`);
                await finalize();
                ws?.close();
                return;
              }

              if (!chatSent) {
                chatSent = true;
                chatRequestId = crypto.randomUUID();
                const chatFrame = {
                  type: "req",
                  id: chatRequestId,
                  method: "chat.send",
                  params: {
                    sessionKey,
                    message: userContent,
                    deliver: false,
                    idempotencyKey: crypto.randomUUID(),
                  },
                };

                console.log(`[openclaw] connect ok, sending chat.send to ${sessionKey}: ${userContent.slice(0, 100)}`);
                ws?.send(JSON.stringify(chatFrame));
              }
              return;
            }

            if (chatRequestId && data.id === chatRequestId) {
              if (!data.ok) {
                await sendAssistantDelta(`\n\n[错误] ${getOpenClawErrorMessage(data, "chat.send 调用失败")}`);
                await finalize();
                ws?.close();
                return;
              }

              const status = typeof data.payload?.status === "string" ? data.payload.status : "unknown";
              console.log(`[openclaw] chat.send ack status=${status}`);
              return;
            }

            console.log(`[openclaw] response for unknown request: ${data.id}`);
            return;
          }

          console.log(`[openclaw] ignoring frame type: ${data.type}`);
        } catch (parseErr) {
          const text = typeof event.data === "string" ? event.data : "";
          if (text && text.trim()) {
            console.log(`[openclaw] non-JSON msg: ${text.slice(0, 100)}`);
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
        console.log(`[openclaw] ws closed code=${e.code} reason=${e.reason} wasClean=${e.wasClean} challengeReceived=${challengeReceived} connectSent=${Boolean(connectRequestId)} chatSent=${chatSent}`);
        if (!done) {
          if (!challengeReceived) {
            await sendAssistantDelta("\n\n[错误] OpenClaw 未返回 connect.challenge，连接被关闭");
          } else if (connectRequestId && !chatSent) {
            await sendAssistantDelta("\n\n[错误] OpenClaw 握手已开始，但 connect 未完成");
          }
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
          await sendAssistantDelta("\n\n[连接错误] WebSocket 异常");
          await finalize();
        }
      };

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
      return await handleOpenClaw(baseUrl, apiKey, modelName, messages, userId);
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
