import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function getAccessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
}

export async function streamChat({
  messages,
  model_id,
  onDelta,
  onDone,
  onSlowConnection,
}: {
  messages: { role: string; content: string }[];
  model_id?: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onSlowConnection?: () => void;
}) {
  const token = await getAccessToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  let firstChunkReceived = false;
  const slowTimer = setTimeout(() => {
    if (!firstChunkReceived) onSlowConnection?.();
  }, 10000);

  try {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ messages, model_id }),
      signal: controller.signal,
    });

    clearTimeout(slowTimer);

    if (resp.status === 429) { toast.error('请求过于频繁，请稍后再试'); throw new Error('Rate limited'); }
    if (resp.status === 402) { toast.error('AI 额度已用完，请充值'); throw new Error('Payment required'); }
    if (resp.status === 504 || resp.status === 408) { toast.error('模型响应超时，请稍后再试'); throw new Error('Timeout'); }
    if (!resp.ok) {
      const errBody = await resp.text().catch(() => '');
      let errMsg = '服务异常，请稍后再试';
      try { const parsed = JSON.parse(errBody); if (parsed.error) errMsg = parsed.error; } catch {}
      toast.error(errMsg);
      throw new Error(errMsg);
    }
    if (!resp.body) throw new Error('No response body');

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!firstChunkReceived) { firstChunkReceived = true; clearTimeout(slowTimer); }
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') { streamDone = true; break; }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    if (textBuffer.trim()) {
      for (let raw of textBuffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }
    onDone();
  } catch (err: any) {
    clearTimeout(slowTimer);
    if (err.name === 'AbortError') {
      toast.error('请求超时，模型未在规定时间内响应');
      throw new Error('Timeout');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
