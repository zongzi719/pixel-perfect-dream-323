import { useMode } from '@/contexts/ModeContext';
import { cn } from '@/lib/utils';
import { User, Users } from 'lucide-react';

export function ModeSelector() {
  const { mode, setMode } = useMode();

  return (
    <div className="flex items-center bg-secondary/60 rounded-full p-0.5 gap-0.5">
      <button
        onClick={() => setMode('private')}
        className={cn(
          'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-all',
          mode === 'private'
            ? 'bg-card text-foreground shadow-sm font-medium'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <User className="h-3.5 w-3.5" />
        私人模式
      </button>
      <button
        onClick={() => setMode('decision')}
        className={cn(
          'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-all',
          mode === 'decision'
            ? 'bg-card text-foreground shadow-sm font-medium'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Users className="h-3.5 w-3.5" />
        决策模式
      </button>
    </div>
  );
}
