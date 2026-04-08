import { useRef, useEffect } from 'react';
import { Message } from '@/types';
import { coaches } from '@/data/coaches';
import { useMode } from '@/contexts/ModeContext';
import { Switch } from '@/components/ui/switch';
import { Copy, Star, RefreshCw, MoreHorizontal, Eye, HelpCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  messages: Message[];
}

function parseStructuredSections(content: string) {
  const sections: { type: 'advice' | 'question' | 'risk' | 'text'; content: string }[] = [];
  const lines = content.split('\n');
  let currentType: 'advice' | 'question' | 'risk' | 'text' = 'text';
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length > 0) {
      sections.push({ type: currentType, content: buffer.join('\n').trim() });
      buffer = [];
    }
  };

  for (const line of lines) {
    if (/^##\s*决策建议/.test(line)) { flush(); currentType = 'advice'; continue; }
    if (/^##\s*关键问题/.test(line)) { flush(); currentType = 'question'; continue; }
    if (/^##\s*风险提示/.test(line)) { flush(); currentType = 'risk'; continue; }
    buffer.push(line);
  }
  flush();

  return sections.length > 0 ? sections : [{ type: 'text' as const, content }];
}

const sectionConfig = {
  advice: { icon: Eye, label: '决策建议', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  question: { icon: HelpCircle, label: '关键问题', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  risk: { icon: AlertTriangle, label: '风险提示', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  text: { icon: Eye, label: '', color: '', bg: '', border: '' },
};

function CoachMessage({ message }: { message: Message }) {
  const { disabledCoaches, toggleCoachActive } = useMode();
  const coach = message.coachId ? coaches.find(c => c.id === message.coachId) : null;
  if (!coach) return null;

  const isDisabled = disabledCoaches.includes(coach.id);
  const sections = parseStructuredSections(message.content);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('已复制');
  };

  return (
    <div className={cn('mb-5 transition-opacity duration-300', isDisabled && 'opacity-30')}>
      {/* Coach header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-base">
            {coach.avatar}
          </div>
          <span className="text-white text-sm font-medium">{coach.name}</span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: `${coach.tagColors[0]}20`,
              color: coach.tagColors[0],
            }}
          >
            {coach.role}
          </span>
        </div>
        <Switch
          checked={!isDisabled}
          onCheckedChange={() => toggleCoachActive(coach.id)}
          className="scale-[0.65] data-[state=checked]:bg-amber-500"
        />
      </div>

      {/* Disabled notice */}
      {isDisabled && (
        <div className="text-white/30 text-xs mb-2 ml-[42px]">后续将不再显示该教练</div>
      )}

      {/* Content */}
      {!isDisabled && (
        <div className="ml-[42px] space-y-2.5">
          {message.isLoading ? (
            <div className="text-white/40 text-sm animate-pulse">正在搜索历史资料...</div>
          ) : (
            <>
              {sections.map((section, i) => {
                if (section.type === 'text') {
                  return (
                    <div key={i} className="text-white/80 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                    </div>
                  );
                }
                const cfg = sectionConfig[section.type];
                const Icon = cfg.icon;
                return (
                  <div key={i} className={cn('rounded-xl border p-3', cfg.bg, cfg.border)}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon size={14} className={cfg.color} />
                      <span className={cn('text-xs font-medium', cfg.color)}>{cfg.label}</span>
                    </div>
                    <div className="text-white/80 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                    </div>
                  </div>
                );
              })}

              {/* Action bar */}
              <div className="flex items-center gap-4 pt-1">
                <button onClick={handleCopy} className="text-white/25 hover:text-white/50 transition-colors">
                  <Copy size={14} />
                </button>
                <button className="text-white/25 hover:text-white/50 transition-colors">
                  <Star size={14} />
                </button>
                <button className="text-white/25 hover:text-white/50 transition-colors">
                  <RefreshCw size={14} />
                </button>
                <button className="text-white/25 hover:text-white/50 transition-colors">
                  <MoreHorizontal size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function MobileDecisionMessages({ messages }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      {messages.map(msg => {
        if (msg.role === 'user') {
          return (
            <div key={msg.id} className="flex justify-end mb-4">
              <div className="max-w-[80%] bg-amber-500/90 rounded-2xl rounded-br-md px-4 py-2.5">
                <p className="text-sm text-white leading-relaxed">{msg.content}</p>
              </div>
            </div>
          );
        }
        return <CoachMessage key={msg.id} message={msg} />;
      })}
      <div ref={endRef} />
    </div>
  );
}
