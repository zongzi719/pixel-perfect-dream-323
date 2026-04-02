import { coaches } from '@/data/coaches';
import { useMode } from '@/contexts/ModeContext';
import { CoachCard } from './CoachCard';

export function CoachSelector() {
  const { selectedCoaches, toggleCoach } = useMode();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {coaches.map(coach => (
        <CoachCard
          key={coach.id}
          coach={coach}
          selected={selectedCoaches.includes(coach.id)}
          onToggle={() => toggleCoach(coach.id)}
        />
      ))}
    </div>
  );
}
