import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { coaches } from '@/data/coaches';
import { useMode } from '@/contexts/ModeContext';
import { cn } from '@/lib/utils';

export function CoachPanel() {
  const [open, setOpen] = useState(false);
  const { selectedCoaches, toggleCoach } = useMode();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <div className="flex -space-x-1.5">
          {selectedCoaches.slice(0, 3).map(id => {
            const c = coaches.find(coach => coach.id === id);
            return c ? (
              <span key={id} className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] border border-background">
                {c.avatar}
              </span>
            ) : null;
          })}
        </div>
        <span className="text-xs">{selectedCoaches.length}/3</span>
        <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl border border-border shadow-lg p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">选择教练</span>
            <span className="text-xs text-muted-foreground">最多选择三个教练 ({selectedCoaches.length}/3)</span>
          </div>
          <div className="space-y-2">
            {coaches.map(coach => {
              const isSelected = selectedCoaches.includes(coach.id);
              return (
                <button
                  key={coach.id}
                  onClick={() => toggleCoach(coach.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left',
                    isSelected ? 'bg-primary/5' : 'hover:bg-secondary'
                  )}
                >
                  <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-base">
                    {coach.avatar}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{coach.name}</p>
                    <div className="flex gap-1 mt-0.5">
                      {coach.tags.map(tag => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
