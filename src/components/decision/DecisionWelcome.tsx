import { coaches } from '@/data/coaches';
import { useMode } from '@/contexts/ModeContext';
import { useChat } from '@/contexts/ChatContext';
import { CoachSelector } from './CoachSelector';
import { CoachBadge } from './CoachBadge';
import { Button } from '@/components/ui/button';

export function DecisionWelcome() {
  const { selectedCoaches, toggleCoach } = useMode();
  const { createConversation, setDecisionStarted } = useChat();

  const selectedCoachData = coaches.filter(c => selectedCoaches.includes(c.id));

  const handleStart = () => {
    createConversation('decision', selectedCoaches);
    setDecisionStarted(true);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4">
      <div className="max-w-xl mx-auto py-8">
        {/* Coach avatars row */}
        <div className="flex justify-center mb-6">
          <div className="flex -space-x-2">
            {coaches.slice(0, 5).map(coach => (
              <div
                key={coach.id}
                className="w-10 h-10 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-lg"
              >
                {coach.avatar}
              </div>
            ))}
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-center text-foreground mb-2">
          欢迎来到决策模式~
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-8">
          选取多个视角来引导你的思考
        </p>

        {/* Coach grid */}
        <CoachSelector />

        {/* Selection info */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              已选教练 {selectedCoaches.length}/3
            </span>
            <div className="flex gap-1.5">
              {selectedCoachData.map(coach => (
                <CoachBadge
                  key={coach.id}
                  coach={coach}
                  onRemove={() => toggleCoach(coach.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={handleStart}
          disabled={selectedCoaches.length === 0}
          className="w-full mt-4 h-12 rounded-full bg-foreground text-background hover:bg-foreground/90 text-sm font-medium"
        >
          开启决策
        </Button>
      </div>
    </div>
  );
}
