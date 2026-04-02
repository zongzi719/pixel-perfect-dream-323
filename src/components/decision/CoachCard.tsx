import { Coach } from '@/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CoachCardProps {
  coach: Coach;
  selected: boolean;
  onToggle: () => void;
}

export function CoachCard({ coach, selected, onToggle }: CoachCardProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'relative w-full text-left p-4 rounded-xl border-2 transition-all',
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-transparent bg-card hover:border-border'
      )}
    >
      {/* Selected check */}
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}

      {/* Default badge */}
      {coach.isDefault && (
        <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
          {selected ? '' : '默认'}
        </span>
      )}

      {/* Avatar + Info */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl flex-shrink-0">
          {coach.avatar}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{coach.name}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {coach.tags.map((tag, i) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{coach.description}</p>
        </div>
      </div>
    </button>
  );
}
