import { Message } from '@/types';
import { coaches } from '@/data/coaches';
import { Switch } from '@/components/ui/switch';
import { useMode } from '@/contexts/ModeContext';
import { cn } from '@/lib/utils';

interface DecisionMessageProps {
  message: Message;
}

export function DecisionMessage({ message }: DecisionMessageProps) {
  const { disabledCoaches, toggleCoachActive } = useMode();
  const coach = message.coachId ? coaches.find(c => c.id === message.coachId) : null;

  if (!coach) return null;

  const isDisabled = disabledCoaches.includes(coach.id);

  return (
    <div className={cn('mb-6 transition-opacity', isDisabled && 'opacity-40')}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-lg flex-shrink-0">
          {coach.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{coach.name}</span>
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-medium',
                coach.id === 'strategy' && 'bg-primary/10 text-primary',
                coach.id === 'risk' && 'bg-coach-risk/10 text-coach-risk',
                coach.id === 'product' && 'bg-coach-product/10 text-coach-product',
              )}>
                {coach.role}
              </span>
            </div>
            <Switch
              checked={!isDisabled}
              onCheckedChange={() => toggleCoachActive(coach.id)}
              className="scale-75"
            />
          </div>
          <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          {message.structuredTags && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {message.structuredTags.map(tag => (
                <span
                  key={tag}
                  className={cn(
                    'text-[10px] px-2.5 py-1 rounded-full border font-medium',
                    tag === '决策建议' && 'border-primary/40 text-primary bg-primary/5',
                    tag === '风险提示' && 'border-coach-risk/40 text-coach-risk bg-coach-risk/5',
                    tag === '关键问题' && 'border-coach-innovation/40 text-coach-innovation bg-coach-innovation/5',
                    tag === '不同视角' && 'border-coach-product/40 text-coach-product bg-coach-product/5',
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
