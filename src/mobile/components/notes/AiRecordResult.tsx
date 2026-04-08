import { X, Calendar, ClipboardList, Lightbulb, Clock } from "lucide-react";
import type { RecordResult } from "./AiRecordModal";

interface Props {
  result: RecordResult;
  onCancel: () => void;
  onSave: () => void;
  onEdit: () => void;
  onClose: () => void;
}

const typeConfig = {
  schedule: {
    icon: Calendar,
    title: "已为你整理为日程安排",
    subtitle: "我提取了时间、事项和提醒信息，你可以确认后保存",
    sectionTitle: "日程安排",
  },
  meeting: {
    icon: ClipboardList,
    title: "已为你整理为会议纪要",
    subtitle: "我提炼了讨论重点、结论与后续行动项",
    sectionTitle: "会议纪要",
  },
  inspiration: {
    icon: Lightbulb,
    title: "已为你整理为灵感笔记",
    subtitle: "我提炼了讨论重点、结论与后续行动项",
    sectionTitle: "会议纪要",
  },
};

export default function AiRecordResult({ result, onCancel, onSave, onEdit, onClose }: Props) {
  const config = typeConfig[result.type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4">
        <div />
        <span className="text-white font-semibold text-[15px]">AI记录</span>
        <button onClick={onClose}>
          <X size={20} className="text-white/60" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {/* Type header */}
        <div className="flex items-center gap-3 mb-1">
          <Icon size={28} className="text-white" />
          <h2 className="text-white text-xl font-bold">{config.title}</h2>
        </div>
        <p className="text-white/40 text-[13px] mb-6">{config.subtitle}</p>

        {/* Section title */}
        <div className="flex items-center gap-1.5 mb-4">
          <span className="w-1 h-4 bg-[#C9A84C] rounded-full" />
          <span className="text-white font-semibold text-sm">{config.sectionTitle}</span>
        </div>

        {/* Content card */}
        <div className="rounded-2xl bg-white/[0.06] p-5 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[#C9A84C] font-bold text-[15px]">{result.title}</span>
            {result.time && (
              <span className="flex items-center gap-1 text-white/40 text-[12px]">
                <Clock size={12} /> {result.time}
              </span>
            )}
          </div>

          {result.sections.map((section, i) => (
            <div key={i}>
              <h4 className="text-white font-semibold text-[14px] mb-2">{section.label}</h4>
              {section.items.length === 1 && !section.items[0].startsWith("•") ? (
                <p className="text-white/50 text-[13px] leading-relaxed">{section.items[0]}</p>
              ) : (
                <ul className="space-y-1">
                  {section.items.map((item, j) => (
                    <li key={j} className="text-white/50 text-[13px] flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/30 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="flex gap-3 px-5 pb-10 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 h-12 rounded-2xl bg-white text-black font-semibold text-sm"
        >
          取消
        </button>
        <button
          onClick={onSave}
          className="flex-1 h-12 rounded-2xl bg-[#C9A84C] text-black font-semibold text-sm"
        >
          保存
        </button>
        <button
          onClick={onEdit}
          className="flex-1 h-12 rounded-2xl bg-black border border-white/20 text-white font-semibold text-sm"
        >
          修改
        </button>
      </div>
    </div>
  );
}
