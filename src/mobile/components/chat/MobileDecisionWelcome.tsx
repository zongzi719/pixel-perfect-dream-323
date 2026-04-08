import { coaches } from '@/data/coaches';
import { useMode } from '@/contexts/ModeContext';
import { useChat } from '@/contexts/ChatContext';
import { Brain, HelpCircle, Lightbulb, ShieldAlert } from 'lucide-react';

const features = [
  { icon: Brain, label: '模拟老板思维', color: 'text-purple-400' },
  { icon: HelpCircle, label: '追问关键问题', color: 'text-cyan-400' },
  { icon: Lightbulb, label: '给出决策建议', color: 'text-amber-400' },
  { icon: ShieldAlert, label: '纠正潜在错误', color: 'text-rose-400' },
];

interface Props {
  onStart: () => void;
}

export default function MobileDecisionWelcome({ onStart }: Props) {
  const { selectedCoaches } = useMode();
  const defaultCoach = coaches.find(c => c.isDefault) || coaches[0];

  return (
    <div className="flex-1 overflow-y-auto px-5 pb-6">
      <div className="flex flex-col items-center pt-8 mb-8">
        {/* Coach avatars */}
        <div className="flex -space-x-2 mb-5">
          {coaches.slice(0, 4).map(c => (
            <div
              key={c.id}
              className="w-10 h-10 rounded-full bg-white/[0.08] border-2 border-black flex items-center justify-center text-lg"
            >
              {c.avatar}
            </div>
          ))}
        </div>

        <h1 className="text-xl font-semibold text-white mb-2">欢迎来到决策模式</h1>
        <p className="text-white/50 text-sm text-center leading-relaxed max-w-[280px]">
          在此模式下，你的商业问题将由多位教练共同分析，帮助您
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {features.map(({ icon: Icon, label, color }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 bg-white/[0.05] rounded-xl px-3.5 py-3"
          >
            <Icon size={18} className={color} />
            <span className="text-white/80 text-xs font-medium">{label}</span>
          </div>
        ))}
      </div>

      {/* Default coach card */}
      <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-white/[0.08] flex items-center justify-center text-xl">
            {defaultCoach.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium">{defaultCoach.name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">
                默认教练
              </span>
            </div>
            <p className="text-white/40 text-xs mt-0.5">{defaultCoach.nameEn}</p>
          </div>
        </div>

        <p className="text-white/60 text-xs leading-relaxed mb-3">
          {defaultCoach.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {defaultCoach.tags.map((tag, i) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${defaultCoach.tagColors[i]}20`,
                color: defaultCoach.tagColors[i],
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="bg-white/[0.04] rounded-xl p-3">
          <p className="text-white/40 text-[10px] mb-1.5">💡 我擅长</p>
          <p className="text-white/70 text-xs leading-relaxed">
            从全局视角审视商业决策，帮助你制定战略规划，进行市场分析和竞争评估。
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="w-full h-12 rounded-full bg-white text-black text-sm font-semibold active:scale-[0.98] transition-transform"
      >
        开始对话
      </button>
    </div>
  );
}
