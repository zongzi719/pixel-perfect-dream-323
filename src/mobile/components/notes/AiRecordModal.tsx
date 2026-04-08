import { useState } from "react";
import { X, Image, Link2, ArrowUp, Mic, Pause } from "lucide-react";
import AiRecordResult from "./AiRecordResult";

const suggestions = ["明天下午三点钟开会", "提醒我准备产品演讲"];

interface AiRecordModalProps {
  open: boolean;
  onClose: () => void;
}

export type RecordResultType = "schedule" | "meeting" | "inspiration";

export interface RecordResult {
  type: RecordResultType;
  title: string;
  time?: string;
  sections: { label: string; items: string[] }[];
}

const mockResults: Record<RecordResultType, RecordResult> = {
  schedule: {
    type: "schedule",
    title: "产品策略会议准备",
    time: "09:30 - 10:30",
    sections: [
      { label: "待办", items: ["准备演示PPT", "整理产品数据", "确认演讲结构"] },
      { label: "行动要点", items: ["重点介绍产品架构", "准备市场案例"] },
    ],
  },
  meeting: {
    type: "meeting",
    title: "新市场试点策略讨论",
    time: "09:30 - 10:30",
    sections: [
      { label: "核心内容", items: ["市场目标选择", "预算投入", "风险评估"] },
      { label: "待办事项", items: ["整理试点城市名单", "预算投入", "风险评估"] },
      { label: "关键结论", items: ["准备市场案例", "先小规模试点，再评估扩展可能性"] },
    ],
  },
  inspiration: {
    type: "inspiration",
    title: "新市场试点策略讨论",
    time: "09:30 - 10:30",
    sections: [
      { label: "核心想法", items: ["构建一套能够复刻领导者战略思维的AI系统，助力团队做出更快、更高质量的决策。"] },
      { label: "待办事项", items: ["AI克隆", "决策支持", "私有知识库", "策略分析"] },
      { label: "关键结论", items: ["企业私有部署", "对话式交互"] },
    ],
  },
};

export default function AiRecordModal({ open, onClose }: AiRecordModalProps) {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(true);
  const [recordTime, setRecordTime] = useState("02 : 32");
  const [result, setResult] = useState<RecordResult | null>(null);

  if (!open) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    // Mock: randomly pick a result type
    const types: RecordResultType[] = ["schedule", "meeting", "inspiration"];
    const picked = types[Math.floor(Math.random() * types.length)];
    setResult(mockResults[picked]);
  };

  const handleSuggestion = (text: string) => {
    setInputText(text);
  };

  const handleSave = () => {
    onClose();
    setResult(null);
    setInputText("");
  };

  if (result) {
    return (
      <div className="fixed inset-0 z-[60] bg-black/90">
        <AiRecordResult
          result={result}
          onCancel={() => setResult(null)}
          onSave={handleSave}
          onEdit={() => setResult(null)}
          onClose={onClose}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      {/* Blurred background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" />

      <div className="relative flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-4">
          <div />
          <span className="text-white font-semibold text-[15px]">AI记录</span>
          <button onClick={onClose}>
            <X size={20} className="text-white/60" />
          </button>
        </div>

        {/* Aurora card area */}
        <div className="flex-1 px-5">
          <div className="relative rounded-3xl overflow-hidden h-full max-h-[480px]">
            {/* Aurora gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-teal-800/30 to-blue-900/40" />
            <div className="absolute inset-0 border border-cyan-400/20 rounded-3xl" />

            <div className="relative p-6 flex flex-col h-full">
              <h2 className="text-white text-xl font-bold leading-relaxed">
                今天有什么灵感/安排事项？
              </h2>
              <p className="text-white text-xl font-bold">
                告诉我，可以帮你生成
              </p>

              <div className="flex flex-wrap gap-2 mt-6">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="text-[13px] text-white/70 px-3 py-2 rounded-full border border-white/20 bg-white/[0.06]"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-1 text-[12px] text-white/40 mt-3">
                换一批 🔄
              </button>

              <div className="flex-1" />

              {/* Input area */}
              {inputText && (
                <div className="bg-white/[0.08] rounded-xl p-3 mb-3">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full bg-transparent text-white text-sm resize-none outline-none min-h-[60px]"
                  />
                </div>
              )}

              {/* Bottom toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Image size={18} className="text-white/50" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Link2 size={18} className="text-white/50" />
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <ArrowUp size={18} className="text-white/50" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Voice recording button */}
        <div className="flex flex-col items-center pb-10 pt-6">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#e8c07a] flex items-center justify-center shadow-lg shadow-[#C9A84C]/30 active:scale-95 transition-transform"
          >
            {isRecording ? (
              <Pause size={24} className="text-black" strokeWidth={2.5} />
            ) : (
              <Mic size={24} className="text-black" strokeWidth={2.5} />
            )}
          </button>
          <span className="text-white/40 text-sm mt-2 font-mono">{recordTime}</span>
          <div className="h-1 w-full mt-3 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent rounded-full" />
        </div>
      </div>
    </div>
  );
}
