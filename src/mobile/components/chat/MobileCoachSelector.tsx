import { coaches } from '@/data/coaches';
import { useMode } from '@/contexts/ModeContext';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileCoachSelector({ isOpen, onClose }: Props) {
  const { selectedCoaches, toggleCoach } = useMode();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-[#1a1a1a] rounded-t-3xl max-h-[75dvh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <div>
            <h3 className="text-white text-base font-semibold">选择教练</h3>
            <p className="text-white/40 text-xs mt-0.5">最多选择三个教练 ({selectedCoaches.length}/3)</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/60 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-3">
          {coaches.map(coach => {
            const isSelected = selectedCoaches.includes(coach.id);
            const isDisabledSelection = !isSelected && selectedCoaches.length >= 3;

            return (
              <button
                key={coach.id}
                onClick={() => !isDisabledSelection && toggleCoach(coach.id)}
                className={cn(
                  'w-full flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all',
                  isSelected
                    ? 'bg-amber-500/[0.08] border-amber-500/30'
                    : 'bg-white/[0.03] border-white/[0.06]',
                  isDisabledSelection && 'opacity-40'
                )}
              >
                <div className="w-11 h-11 rounded-full bg-white/[0.08] flex items-center justify-center text-xl shrink-0">
                  {coach.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
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
                  <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{coach.description}</p>
                </div>
                <div
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-colors',
                    isSelected
                      ? 'bg-amber-500 border-amber-500'
                      : 'border-white/20'
                  )}
                >
                  {isSelected && <Check size={14} className="text-black" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
