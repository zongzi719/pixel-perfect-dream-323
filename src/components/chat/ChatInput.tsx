import { useState } from 'react';
import { Send, Plus, Mic, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';
import { useMode } from '@/contexts/ModeContext';
import { coaches } from '@/data/coaches';
import { toast } from 'sonner';

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
}: {
  messages: { role: string; content: string }[];
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (resp.status === 429) {
    toast.error('请求过于频繁，请稍后再试');
    throw new Error('Rate limited');
  }
  if (resp.status === 402) {
    toast.error('AI 额度已用完，请充值');
    throw new Error('Payment required');
  }
  if (!resp.ok || !resp.body) throw new Error('Failed to start stream');

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = '';
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
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

  // flush remaining
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
}

export function ChatInput() {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const { addMessage, createConversation, currentConversation, updateLastAssistantMessage } = useChat();
  const { mode, selectedCoaches } = useMode();

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const convId = currentConversation?.id ?? createConversation(mode, mode === 'decision' ? selectedCoaches : undefined);
    const userContent = input.trim();

    addMessage({ role: 'user', content: userContent }, convId);
    setInput('');

    if (mode === 'decision') {
      // Decision mode: get responses from each coach
      for (let i = 0; i < selectedCoaches.length; i++) {
        const coachId = selectedCoaches[i];
        const coach = coaches.find(c => c.id === coachId);
        const coachRole = coach?.role || '教练';

        addMessage({ role: 'assistant', content: '', coachId, isLoading: true }, convId);
        setIsStreaming(true);

        let accumulated = '';
        try {
          await streamChat({
            messages: [
              { role: 'system', content: `你是一位${coachRole}（${coach?.name}），${coach?.description}。请从你的专业角度分析用户的问题，给出有深度的建议。` },
              { role: 'user', content: userContent },
            ],
            onDelta: (chunk) => {
              accumulated += chunk;
              updateLastAssistantMessage(accumulated, convId);
            },
            onDone: () => {},
          });
        } catch (e) {
          if (!accumulated) {
            updateLastAssistantMessage(`抱歉，AI 回复出错了。`, convId);
          }
        }
      }
      setIsStreaming(false);
    } else {
      // Private mode: single AI response
      addMessage({ role: 'assistant', content: '', isLoading: true }, convId);
      setIsStreaming(true);

      // Build conversation history from existing messages
      const history = currentConversation?.messages.map(m => ({ role: m.role, content: m.content })) || [];
      history.push({ role: 'user', content: userContent });

      let accumulated = '';
      try {
        await streamChat({
          messages: history,
          onDelta: (chunk) => {
            accumulated += chunk;
            updateLastAssistantMessage(accumulated, convId);
          },
          onDone: () => setIsStreaming(false),
        });
      } catch (e) {
        setIsStreaming(false);
        if (!accumulated) {
          updateLastAssistantMessage('抱歉，AI 回复出错了，请稍后再试。', convId);
        }
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-card rounded-2xl border border-border shadow-sm">
        {/* Input area */}
        <div className="flex items-end gap-2 p-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="咨询任何问题"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[36px] max-h-[120px] py-2"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="h-8 w-8 rounded-full bg-foreground text-background hover:bg-foreground/90"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-0">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              工具
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">默认</span>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-secondary/50 text-muted-foreground/60">私有化</span>
            <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
              AIYOU-记忆模型
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
