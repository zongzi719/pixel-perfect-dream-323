import { Message } from '@/types';
import { coaches } from '@/data/coaches';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

const tagColorMap: Record<string, string> = {
  '决策建议': 'border-primary/40 text-primary bg-primary/5',
  '风险提示': 'border-coach-risk/40 text-coach-risk bg-coach-risk/5',
  '关键问题': 'border-coach-innovation/40 text-coach-innovation bg-coach-innovation/5',
  '不同视角': 'border-coach-product/40 text-coach-product bg-coach-product/5',
};

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const coach = message.coachId ? coaches.find(c => c.id === message.coachId) : null;

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] bg-user-bubble text-user-bubble-foreground rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-6">
      {coach ? (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-lg">
          {coach.avatar}
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
          <span className="text-sm">🤖</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        {coach && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm font-medium text-foreground">{coach.name}</span>
            <span className={cn(
              'text-[10px] px-2 py-0.5 rounded-full font-medium',
              coach.id === 'strategy' && 'bg-primary/10 text-primary',
              coach.id === 'risk' && 'bg-coach-risk/10 text-coach-risk',
              coach.id === 'product' && 'bg-coach-product/10 text-coach-product',
              coach.id === 'data' && 'bg-coach-data/10 text-coach-data',
              coach.id === 'innovation' && 'bg-coach-innovation/10 text-coach-innovation',
              coach.id === 'operations' && 'bg-coach-operations/10 text-coach-operations',
            )}>
              {coach.role}
            </span>
          </div>
        )}
        <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
        {message.structuredTags && message.structuredTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {message.structuredTags.map(tag => (
              <span
                key={tag}
                className={cn(
                  'text-[10px] px-2.5 py-1 rounded-full border font-medium',
                  tagColorMap[tag] || 'border-border text-muted-foreground'
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
