import { useState } from "react";
import { Search, Lock, Brain, MessageCircle, Target, Compass } from "lucide-react";

const categories = ["全部", "认知", "语言习惯", "决策风格", "当前目标"] as const;

const pendingMemory = {
  countdown: "3天后消失",
  isPrivate: true,
  content: "我认为在人际交往过程中，倾向于寻找并结识那些很有自己思路和方法、不随波逐流且具有独立思考能力的人",
};

const confirmedMemories = [
  { icon: Brain, color: "text-blue-400", bg: "bg-blue-400/10", category: "认知", content: "你认为长期品牌价值比短期利润更重要。" },
  { icon: MessageCircle, color: "text-orange-400", bg: "bg-orange-400/10", category: "语言习惯", content: "你习惯用\"先验证再扩张\"的表达方式。" },
  { icon: Target, color: "text-pink-400", bg: "bg-pink-400/10", category: "决策风格", content: "你在重大决策时更倾向谨慎策略。\n我会重点投入核心团队（产品、设计、开发）、试点用户、最小可行技术平台、预算与时间，以及完善的反馈收集机制" },
  { icon: Compass, color: "text-amber-400", bg: "bg-amber-400/10", category: "当前目标", content: "你正在推进产品MVP。" },
];

export default function UserMemories() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("全部");

  const filtered = activeFilter === "全部"
    ? confirmedMemories
    : confirmedMemories.filter((m) => m.category === activeFilter);

  return (
    <>
      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索记忆"
          className="w-full h-10 pl-9 pr-3 rounded-xl bg-white/[0.06] text-sm text-white placeholder:text-white/30 border-none outline-none"
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`shrink-0 text-[12px] px-3 py-1.5 rounded-full border transition-all ${
              activeFilter === cat
                ? "bg-[#C9A84C] border-[#C9A84C] text-black font-semibold"
                : "border-white/10 text-white/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Pending memory */}
      <div className="rounded-2xl border border-[#C9A84C]/40 bg-[#C9A84C]/[0.06] p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-bold text-[13px]">待确认:{pendingMemory.countdown}</span>
          {pendingMemory.isPrivate && (
            <span className="flex items-center gap-1 text-[11px] text-[#C9A84C] bg-[#C9A84C]/10 px-2 py-0.5 rounded-full">
              <Lock size={10} /> 私密记忆
            </span>
          )}
        </div>
        <p className="text-[13px] text-white/60 leading-relaxed mb-4">{pendingMemory.content}</p>
        <div className="flex gap-3">
          <button className="flex-1 h-10 rounded-xl bg-white/10 text-white text-[13px] font-medium">取消</button>
          <button className="flex-1 h-10 rounded-xl bg-white text-black text-[13px] font-medium">接受</button>
        </div>
      </div>

      {/* Confirmed memories */}
      <div className="space-y-3">
        {filtered.map((mem, i) => {
          const Icon = mem.icon;
          return (
            <div key={i} className="rounded-2xl bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-lg ${mem.bg} flex items-center justify-center`}>
                  <Icon size={14} className={mem.color} />
                </div>
                <span className="text-white font-semibold text-[13px]">{mem.category}</span>
              </div>
              <p className="text-[13px] text-white/50 leading-relaxed whitespace-pre-line">{mem.content}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}
