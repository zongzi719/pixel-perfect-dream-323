import { Star } from "lucide-react";
import { useState } from "react";

const radarData = {
  认知模型: 70,
  语言风格: 76,
  决策逻辑: 69,
  战略方法: 85,
};

const cogTabs = ["认知模型", "语言风格", "战略方法", "决策逻辑"] as const;

const tabDescriptions: Record<string, string> = {
  认知模型: "以提高组织执行力。我会优先考虑核心岗位的能力匹配和关键流程的效率。我比较关注跨部门协作与信息共享，以保证战略目标能够顺利落实。",
  语言风格: "你习惯用简洁、直接的方式表达观点，偏好数据支撑论证，不喜欢冗长的修饰词汇。",
  战略方法: "你倾向于从全局视角出发，先确定方向再逐步推进细节，注重可执行性和资源效率。",
  决策逻辑: "你在决策时优先考虑数据和逻辑分析，但也会参考团队意见和市场反馈进行综合判断。",
};

function RadarChart() {
  const labels = Object.keys(radarData);
  const values = Object.values(radarData);
  const cx = 140, cy = 130, r = 90;

  const angles = labels.map((_, i) => (Math.PI * 2 * i) / labels.length - Math.PI / 2);
  const points = angles.map((a, i) => {
    const v = values[i] / 100;
    return { x: cx + r * v * Math.cos(a), y: cy + r * v * Math.sin(a) };
  });
  const polygon = points.map(p => `${p.x},${p.y}`).join(" ");

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 280 260" className="w-full max-w-[280px] mx-auto">
      <defs>
        <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#4ade80" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
        </radialGradient>
      </defs>

      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={angles.map(a => `${cx + r * level * Math.cos(a)},${cy + r * level * Math.sin(a)}`).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}

      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      ))}

      <polygon points={polygon} fill="url(#radarFill)" stroke="#C9A84C" strokeWidth="1.5" opacity="0.9" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#C9A84C" />
      ))}

      {labels.map((label, i) => {
        const labelR = r + 20;
        const x = cx + labelR * Math.cos(angles[i]);
        const y = cy + labelR * Math.sin(angles[i]);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-[11px]" fill="white">
            {label}{" "}
            <tspan fill="#C9A84C" fontWeight="bold">{values[i]}</tspan>
            <tspan fill="rgba(255,255,255,0.4)" fontSize="9">%</tspan>
          </text>
        );
      })}
    </svg>
  );
}

export default function AiCeoProfile() {
  const [activeTab, setActiveTab] = useState<string>("认知模型");

  return (
    <div className="px-4 pb-6 space-y-5">
      {/* Profile header */}
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-900/40 to-amber-700/20 overflow-hidden flex items-center justify-center shrink-0">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-200 to-amber-100 flex items-center justify-center text-2xl">
            🧑‍💼
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white tracking-wide">MOUMOU</h2>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">创始人·科技创业者</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">AI·互联网·SaaS</span>
          </div>
          <p className="text-[11px] text-white/40 mt-1.5">AI学习数据 - 35份资料 · 2.5小时访谈</p>
        </div>
      </div>

      {/* Alignment card */}
      <div className="rounded-2xl border border-[#C9A84C]/40 bg-black/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[#C9A84C] font-semibold text-sm">对齐率</span>
          <span className="text-[#C9A84C] font-bold text-2xl">Lv.3</span>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-white/60">当前水平：<span className="text-[#C9A84C]">标准</span></span>
          <span className="text-white/40">预计再互动30分钟可升至下一等级</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-[#C9A84C] to-[#e8c07a]" style={{ width: "65%" }} />
        </div>

        <div className="flex items-center justify-between text-[12px] border-t border-dashed border-white/10 pt-3">
          <span className="text-white/40">模型匹配度</span>
          <span className="text-[#C9A84C] font-bold text-base">65%</span>
        </div>
        <div className="flex items-center justify-between text-[12px] border-t border-dashed border-white/10 pt-3">
          <span className="text-white/40">MBTI</span>
          <span className="text-[#C9A84C] font-bold text-base">ENTJ</span>
        </div>

        {/* Three metrics bar */}
        <div className="flex items-center rounded-xl bg-white/[0.04] divide-x divide-white/10 mt-1">
          {[
            { label: "认知覆盖", value: "产品经验" },
            { label: "核心关注", value: "数据导向" },
            { label: "决策风格", value: "战略型思维" },
          ].map((m) => (
            <div key={m.label} className="flex-1 py-3 text-center">
              <div className="text-[10px] text-white/40">{m.label}</div>
              <div className="text-[13px] font-semibold text-white mt-0.5">{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cognitive tabs */}
      <div className="flex items-center gap-6 border-b border-white/10 overflow-x-auto">
        {cogTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 text-sm whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "text-white font-semibold border-b-2 border-white"
                : "text-white/40"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Radar chart card */}
      <div className="rounded-2xl bg-white/[0.04] p-4">
        <div className="text-[#C9A84C] text-sm font-semibold mb-2">模型完善度</div>
        <RadarChart />
      </div>

      {/* Description */}
      <p className="text-[13px] text-white/60 leading-relaxed">
        {tabDescriptions[activeTab]}
      </p>
    </div>
  );
}
