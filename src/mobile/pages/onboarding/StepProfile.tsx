import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import mobileBg from "@/assets/mobile-bg.jpg";

interface StepProfileProps {
  avatarUrl: string | null;
  onComplete: () => void;
}

const RADAR_METRICS = [
  { label: "认知模型", value: 70 },
  { label: "语言风格", value: 76 },
  { label: "战略方法", value: 85 },
  { label: "决策逻辑", value: 69 },
];

const TABS = ["认知模型", "语言风格", "战略方法", "决策逻辑"];

const DIMENSION_CARDS = [
  { title: "认知覆盖", value: "产品经验", color: "#2dd4bf" },
  { title: "核心关注", value: "数据导向", color: "#c9a84c" },
  { title: "决策风格", value: "战略型思维", color: "#818cf8" },
];

function RadarChart({ metrics }: { metrics: typeof RADAR_METRICS }) {
  const cx = 100, cy = 100, r = 70;
  const n = metrics.length;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (value: number, index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const ratio = value / 100;
    return {
      x: cx + r * ratio * Math.cos(angle),
      y: cy + r * ratio * Math.sin(angle),
    };
  };

  const dataPoints = metrics.map((m, i) => getPoint(m.value, i));
  const polygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[200px] mx-auto">
      {/* Grid */}
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={Array.from({ length: n }, (_, i) => {
            const p = getPoint(ring * 100, i);
            return `${p.x},${p.y}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />
      ))}
      {/* Axes */}
      {metrics.map((_, i) => {
        const p = getPoint(100, i);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />;
      })}
      {/* Data polygon */}
      <polygon points={polygon} fill="rgba(201,168,76,0.15)" stroke="#c9a84c" strokeWidth="1.5" />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#c9a84c" />
      ))}
      {/* Labels */}
      {metrics.map((m, i) => {
        const labelPoint = getPoint(120, i);
        return (
          <text
            key={i}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.6)"
            fontSize="8"
          >
            {m.label} {m.value}%
          </text>
        );
      })}
    </svg>
  );
}

export default function StepProfile({ avatarUrl, onComplete }: StepProfileProps) {
  const [phase, setPhase] = useState<"generating" | "profile">("generating");
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useAuth();
  const [username, setUsername] = useState("用户");

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.username) setUsername(data.username);
        });
    }
  }, [user]);

  // Generation animation
  useEffect(() => {
    if (phase !== "generating") return;
    const steps = [
      { target: 30, delay: 800 },
      { target: 60, delay: 1600 },
      { target: 90, delay: 2400 },
      { target: 100, delay: 3200 },
    ];
    const timers = steps.map((s) =>
      setTimeout(() => setProgress(s.target), s.delay)
    );
    const done = setTimeout(() => setPhase("profile"), 3800);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [phase]);

  if (phase === "generating") {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-black relative">
        {/* Particle ring animation */}
        <div className="relative w-40 h-40 mb-8">
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              background: "conic-gradient(from 0deg, transparent, rgba(201,168,76,0.3), transparent, rgba(201,168,76,0.1), transparent)",
              animationDuration: "3s",
            }}
          />
          <div className="absolute inset-3 rounded-full bg-black flex items-center justify-center">
            <span className="text-2xl font-light tracking-[0.3em]" style={{ color: "#d4b966" }}>
              AI YOU
            </span>
          </div>
        </div>

        <p className="text-white/80 text-base mb-8">正在创建您的数字分身</p>

        <div className="w-64 space-y-3 mb-6">
          {["面部特征分析", "生成虚拟形象身份", "构建认知模型"].map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border ${progress > (i + 1) * 30 ? "bg-teal-500 border-teal-500" : "border-white/20"} flex items-center justify-center`}>
                {progress > (i + 1) * 30 && <span className="text-white text-[8px]">✓</span>}
              </div>
              <span className={`text-sm ${progress > (i + 1) * 30 ? "text-white/80" : "text-white/30"}`}>{label}</span>
            </div>
          ))}
        </div>

        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #c9a84c, #d4b966)",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-black">
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center pt-16 px-6">
          <div className="relative w-24 h-24 mb-4">
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: "conic-gradient(from 0deg, #c9a84c, #a08633, #c9a84c)", padding: "3px" }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-black">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{username[0]}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">{username}</h2>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {["创始人", "科技创业者", "AI", "互联网", "SaaS"].map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs bg-white/[0.06] text-white/60 border border-white/10">
                {tag}
              </span>
            ))}
          </div>

          <p className="text-white/40 text-xs mb-6">AI学习数据 · 35份资料 · 2.5小时访谈</p>
        </div>

        {/* Alignment card */}
        <div className="mx-5 mb-5 bg-white/[0.04] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-sm font-bold">Lv.3</span>
              <span className="text-white/40 text-xs">标准</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40 text-xs">模型匹配度</span>
              <span className="text-amber-400 text-sm font-bold">65%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-xs">MBTI:</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-bold">ENTJ</span>
          </div>
        </div>

        {/* Dimension cards */}
        <div className="grid grid-cols-3 gap-3 mx-5 mb-5">
          {DIMENSION_CARDS.map((d) => (
            <div key={d.title} className="bg-white/[0.04] border border-white/10 rounded-xl p-3 text-center">
              <p className="text-white/40 text-[10px] mb-1">{d.title}</p>
              <p className="text-sm font-medium" style={{ color: d.color }}>{d.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mx-5 mb-4">
          <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === i
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-white/40"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Radar chart */}
        <div className="mx-5 mb-5">
          <RadarChart metrics={RADAR_METRICS} />
        </div>

        {/* Description */}
        <div className="mx-5 mb-6">
          <p className="text-white/50 text-xs leading-relaxed">
            基于您的访谈数据和上传资料，AI已构建初步的认知模型。
            随着更多对话和数据输入，模型将持续优化，越来越准确地理解您的思维方式和决策逻辑。
          </p>
        </div>
      </div>

      {/* Bottom button */}
      <div className="fixed bottom-0 left-0 right-0 px-6 pb-8 pt-4 bg-gradient-to-t from-black via-black to-transparent">
        <button
          onClick={onComplete}
          className="w-full h-[52px] rounded-full text-black text-base font-medium active:scale-[0.98] transition-all"
          style={{ background: "linear-gradient(135deg, #c9a84c, #a08633)" }}
        >
          完成设置，开启和AI CEO对话
        </button>
      </div>
    </div>
  );
}
