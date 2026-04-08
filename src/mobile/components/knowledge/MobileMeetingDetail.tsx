import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MoreHorizontal, Play, SkipBack, SkipForward, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

const mockMeeting = {
  title: "AI数字增长战略和核心价值讨论",
  creator: "张明",
  date: "3月12日 14:00",
  duration: "45:30",
  currentTime: "12:35",
  progress: 0.28,
};

const contentTabs = ["转写", "AI纪要", "章节"] as const;

const mockTranscript = [
  { speaker: "张明", time: "00:01", text: "今天我们主要讨论AI数字增长战略的核心价值和实施路径。" },
  { speaker: "李华", time: "00:38", text: "我认为我们首先需要明确AI在我们业务中的定位，是效率工具还是核心产品。" },
  { speaker: "张明", time: "01:15", text: "这是一个很好的问题。我建议我们从三个维度来分析..." },
  { speaker: "王芳", time: "02:00", text: "从市场数据来看，AI驱动的产品增长率是传统产品的3倍。" },
  { speaker: "陈强", time: "03:20", text: "技术层面，我们需要考虑模型选型和基础设施的投入。" },
];

const mockAISummary = {
  title: "AI数字增长战略的核心价值",
  branches: [
    {
      label: "战略定位",
      color: "#C9A84C",
      cards: [
        {
          title: "AI作为核心增长引擎",
          points: ["从效率工具升级为核心产品能力", "建立AI原生的产品体验", "数据驱动的决策体系"],
        },
      ],
    },
    {
      label: "实施路径",
      color: "#6B8AFF",
      cards: [
        {
          title: "三阶段推进计划",
          points: ["Phase 1: 内部效率提升（Q1-Q2）", "Phase 2: 产品AI化（Q2-Q3）", "Phase 3: AI原生产品（Q3-Q4）"],
        },
      ],
    },
    {
      label: "关键指标",
      color: "#4ECDC4",
      cards: [
        {
          title: "识别组织断点",
          grid: [
            "效率提升 40%",
            "成本降低 25%",
            "用户增长 3x",
            "留存提升 60%",
          ],
        },
      ],
    },
  ],
  conclusions: [
    "AI应定位为公司核心增长引擎，而非仅作为效率工具",
    "三阶段推进路径获得团队一致认可",
    "Q1重点：完成内部AI工具部署，建立数据基础设施",
    "需要在下次会议前完成技术选型方案",
  ],
};

const mockChapters = [
  { time: "00:00", title: "开场与议程确认", duration: "2分钟" },
  { time: "02:00", title: "AI战略定位讨论", duration: "12分钟" },
  { time: "14:00", title: "实施路径规划", duration: "15分钟" },
  { time: "29:00", title: "关键指标与里程碑", duration: "10分钟" },
  { time: "39:00", title: "总结与下一步行动", duration: "6分钟" },
];

export default function MobileMeetingDetail() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<typeof contentTabs[number]>("AI纪要");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const toggleSpeed = () => {
    const speeds = [1, 1.5, 2, 0.5];
    const idx = speeds.indexOf(speed);
    setSpeed(speeds[(idx + 1) % speeds.length]);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Top Nav */}
      <div className="flex items-center justify-between px-4 pt-14 pb-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-white/60">
          <ChevronLeft size={20} />
          <span className="text-sm">预览</span>
        </button>
        <button><MoreHorizontal size={20} className="text-white/50" /></button>
      </div>

      {/* Meeting Info */}
      <div className="px-5 pb-4">
        <h2 className="text-base font-semibold text-white">{mockMeeting.title}</h2>
        <p className="text-xs text-white/40 mt-1">{mockMeeting.creator} @{mockMeeting.date}</p>
      </div>

      {/* Audio Player */}
      <div className="px-5 pb-4">
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4">
          {/* Progress Bar */}
          <div className="relative h-1 bg-white/[0.08] rounded-full mb-2">
            <div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ width: `${mockMeeting.progress * 100}%`, backgroundColor: "#C9A84C" }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2"
              style={{ left: `${mockMeeting.progress * 100}%`, backgroundColor: "#C9A84C", borderColor: "#C9A84C" }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/30 mb-3">
            <span>{mockMeeting.currentTime}</span>
            <span>{mockMeeting.duration}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button className="w-8 h-8 flex items-center justify-center">
              <div className="flex gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-0.5 rounded-full bg-white/30" style={{ height: `${8 + Math.random() * 8}px` }} />
                ))}
              </div>
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-white/60">
              <SkipBack size={20} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#C9A84C" }}
            >
              {isPlaying ? <Pause size={24} className="text-black" /> : <Play size={24} className="text-black ml-0.5" />}
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-white/60">
              <SkipForward size={20} />
            </button>
            <button onClick={toggleSpeed} className="w-8 h-8 flex items-center justify-center">
              <span className="text-xs text-white/50 font-medium">{speed}x</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="px-5 pb-3">
        <div className="flex gap-0 border-b border-white/[0.06]">
          {contentTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 pb-2.5 text-sm font-medium text-center relative transition-colors",
                activeTab === tab ? "text-white" : "text-white/40"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full" style={{ backgroundColor: "#C9A84C" }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {activeTab === "转写" && (
          <div className="space-y-4">
            {mockTranscript.map((entry, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="shrink-0">
                  <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-[10px] text-white/60 font-medium">
                    {entry.speaker[0]}
                  </div>
                  <p className="text-[10px] text-white/30 text-center mt-0.5">{entry.time}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/50 mb-0.5">{entry.speaker}</p>
                  <p className="text-sm text-white/80 leading-relaxed">{entry.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "AI纪要" && (
          <div className="space-y-6">
            {/* Title */}
            <h3 className="text-lg font-bold" style={{ color: "#C9A84C" }}>{mockAISummary.title}</h3>

            {/* Mind Map Branches */}
            <div className="space-y-6">
              {mockAISummary.branches.map((branch, bi) => (
                <div key={bi} className="flex gap-3">
                  {/* Vertical line + node */}
                  <div className="flex flex-col items-center shrink-0 w-6">
                    <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: branch.color, backgroundColor: `${branch.color}30` }} />
                    {bi < mockAISummary.branches.length - 1 && (
                      <div className="flex-1 w-px" style={{ backgroundColor: `${branch.color}30` }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full mb-3 inline-block" style={{ color: branch.color, backgroundColor: `${branch.color}15` }}>
                      {branch.label}
                    </span>
                    {branch.cards.map((card, ci) => (
                      <div key={ci} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4 mt-2" style={{ borderLeftColor: branch.color, borderLeftWidth: 2 }}>
                        <h4 className="text-sm font-medium text-white mb-2">{card.title}</h4>
                        {card.points && (
                          <ul className="space-y-1.5">
                            {card.points.map((p, pi) => (
                              <li key={pi} className="flex items-start gap-2">
                                <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: branch.color }} />
                                <span className="text-xs text-white/60 leading-relaxed">{p}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {card.grid && (
                          <div className="grid grid-cols-2 gap-2">
                            {card.grid.map((g, gi) => (
                              <div key={gi} className="rounded-lg bg-white/[0.04] p-2.5 text-center">
                                <span className="text-xs text-white/70">{g}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Conclusions */}
            <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
              <h4 className="text-sm font-medium text-white mb-2">关键结论</h4>
              <ul className="space-y-1.5">
                {mockAISummary.conclusions.map((c, ci) => (
                  <li key={ci} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span className="text-xs text-white/60 leading-relaxed">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "章节" && (
          <div className="space-y-2">
            {mockChapters.map((ch, idx) => (
              <button key={idx} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-left active:bg-white/[0.08] transition-colors">
                <span className="text-xs font-mono shrink-0" style={{ color: "#C9A84C" }}>{ch.time}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{ch.title}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{ch.duration}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
