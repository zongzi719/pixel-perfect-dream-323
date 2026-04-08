import { useRef, useEffect } from 'react';
import { Copy, Bookmark, RefreshCw, MoreHorizontal, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/types';
import { toast } from 'sonner';

interface Props {
  messages: Message[];
  onRegenerate?: () => void;
}

export default function MobileChatMessages({ messages, onRegenerate }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messages[messages.length - 1]?.content]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('已复制');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          {msg.role === 'user' ? (
            <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-md bg-amber-500/90 text-white text-sm leading-relaxed">
              {msg.content}
            </div>
          ) : (
            <div className="max-w-[85%] space-y-1.5">
              <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white/[0.07] border border-white/[0.08] text-white/90 text-sm leading-relaxed">
                {msg.isLoading && !msg.content ? (
                  <div className="flex items-center gap-2 text-white/40">
                    <Loader2 size={14} className="animate-spin" />
                    <span>思考中...</span>
                  </div>
                ) : (
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_code]:text-amber-300 [&_pre]:bg-black/30 [&_pre]:rounded-lg [&_pre]:p-3">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              {/* Action bar */}
              {msg.content && !msg.isLoading && (
                <div className="flex items-center gap-3 px-1">
                  <button onClick={() => handleCopy(msg.content)} className="text-white/25 hover:text-white/50 transition-colors">
                    <Copy size={14} />
                  </button>
                  <button className="text-white/25 hover:text-white/50 transition-colors">
                    <Bookmark size={14} />
                  </button>
                  {onRegenerate && (
                    <button onClick={onRegenerate} className="text-white/25 hover:text-white/50 transition-colors">
                      <RefreshCw size={14} />
                    </button>
                  )}
                  <button className="text-white/25 hover:text-white/50 transition-colors">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
