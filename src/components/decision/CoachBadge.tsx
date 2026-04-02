import { Coach } from '@/types';
import { X } from 'lucide-react';

interface CoachBadgeProps {
  coach: Coach;
  onRemove?: () => void;
}

export function CoachBadge({ coach, onRemove }: CoachBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 pl-1 pr-2 py-0.5 rounded-full bg-secondary text-sm">
      <span className="w-5 h-5 rounded-full bg-card flex items-center justify-center text-xs">
        {coach.avatar}
      </span>
      <span className="text-xs text-foreground">{coach.name}</span>
      {onRemove && (
        <button onClick={onRemove} className="text-muted-foreground hover:text-foreground">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
