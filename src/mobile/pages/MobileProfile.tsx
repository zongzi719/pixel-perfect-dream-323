import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Settings, User, Clock, Check } from "lucide-react";
import { useState, useRef } from "react";

const mockTodos = [
  { id: "1", text: "设计产品原型", done: false },
  { id: "2", text: "投资人会议准备", done: false },
  { id: "3", text: "更新市场调研", done: true },
  { id: "4", text: "团队产品讨论", done: true },
];

const mockTasks = [
  {
    title: "产品策略会议准备",
    time: "09:30 – 10:30",
    subtasks: ["准备演示PPT", "整理产品数据", "确认演讲结构"],
    priority: "核心" as const,
    done: 2,
    total: 3,
  },
  {
    title: "设计产品原型",
    time: "09:30 – 10:30",
    subtasks: ["准备演示PPT", "整理产品数据", "确认演讲结构"],
    priority: "重要" as const,
    done: 2,
    total: 3,
  },
  {
    title: "产品交互图",
    time: "09:30 – 10:30",
    subtasks: ["准备演示PPT", "整理产品数据", "确认演讲结构"],
    priority: "次要" as const,
    done: 2,
    total: 3,
  },
];

const priorityStyles: Record<string, string> = {
  核心: "bg-[#E8940C] text-white",
  重要: "bg-[#C9A84C] text-white",
  次要: "bg-[#C9A84C]/70 text-white",
};

function SwipeTodoItem({ item, onToggle }: { item: typeof mockTodos[0]; onToggle: () => void }) {
  const [offset, setOffset] = useState(0);
  const startX = useRef(0);
  const currentOffset = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentOffset.current = offset;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - startX.current;
    const next = Math.max(-120, Math.min(0, currentOffset.current + diff));
    setOffset(next);
  };
  const handleTouchEnd = () => {
    setOffset(offset < -50 ? -120 : 0);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mb-2.5">
      {/* Swipe actions */}
      <div className="absolute right-0 top-0 bottom-0 flex items-stretch" style={{ width: 120 }}>
        <button className="flex-1 flex items-center justify-center bg-[#3a3a3a]">
          <span className="text-xs text-white/80">编辑</span>
        </button>
        <button className="flex-1 flex items-center justify-center bg-[#3a3a3a]">
          <span className="text-xs text-[#C9A84C]">删除</span>
        </button>
      </div>
      {/* Foreground */}
      <div
        className="relative bg-[#1c1c1e] px-5 py-4 flex items-center gap-3 transition-transform"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <span className={`flex-1 text-[15px] ${item.done ? "text-white/30" : "text-white/80"}`}>
          {item.text}
        </span>
        <button onClick={onToggle} className="shrink-0">
          {item.done ? (
            <div className="w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center">
              <Check size={14} className="text-white/30" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border-2 border-white/40" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function MobileProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todos, setTodos] = useState(mockTodos);

  const doneCount = 3;
  const totalCount = 8;
  const pct = 63;
  const phone = user?.user_metadata?.phone || user?.email?.split("@")[0] || "MOUMOU";

  return (
    <div className="flex flex-col h-full bg-black overflow-y-auto pb-24">
      {/* Hero gradient header */}
      <div className="relative" style={{
        background: "linear-gradient(180deg, #0a2a2a 0%, #0d1f1f 40%, #000000 100%)",
        paddingTop: "env(safe-area-inset-top, 44px)",
      }}>
        {/* Settings icon */}
        <div className="flex justify-end px-5 pt-4 pb-2">
          <button onClick={() => navigate("/m/settings")} className="w-8 h-8 flex items-center justify-center">
            <Settings size={20} className="text-white/70" />
          </button>
        </div>

        {/* Profile info */}
        <div className="px-5 pb-8 flex items-center gap-4">
          <button onClick={() => navigate("/m/account")} className="shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-200 to-cyan-400 flex items-center justify-center overflow-hidden">
              <User size={36} className="text-cyan-800" />
            </div>
          </button>
          <button onClick={() => navigate("/m/account")} className="flex-1 text-left">
            <h2 className="text-xl font-bold text-white tracking-wide">{phone}</h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-white/70 border border-white/10">创始人 · 科技创业者</span>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-white/70 border border-white/10">AI · 互联网 · SaaS</span>
            </div>
            <p className="text-[11px] text-white/40 mt-2">AI学习数据 – 35份资料 · 2.5小时访谈</p>
          </button>
        </div>
      </div>

      {/* 待处理事务 */}
      <div className="px-5 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full bg-[#C9A84C]" />
          <span className="text-[15px] font-semibold text-white">待处理事务</span>
          <span className="text-[15px] font-bold text-[#C9A84C] ml-2">{pct}%</span>
          <div className="flex-1 h-2 bg-white/10 rounded-full mx-2 overflow-hidden">
            <div className="h-full bg-[#C9A84C] rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-medium text-white/60">{doneCount}/{totalCount}</span>
        </div>
      </div>

      {/* 今日重点事项 */}
      <div className="px-5 mt-7">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded-full bg-[#C9A84C]" />
          <span className="text-[15px] font-semibold text-white">今日重点事项</span>
        </div>
        <div>
          {todos.map((item) => (
            <SwipeTodoItem
              key={item.id}
              item={item}
              onToggle={() =>
                setTodos((prev) => prev.map((t) => (t.id === item.id ? { ...t, done: !t.done } : t)))
              }
            />
          ))}
        </div>
      </div>

      {/* 今日任务 */}
      <div className="px-5 mt-7">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 rounded-full bg-[#C9A84C]" />
          <span className="text-[15px] font-semibold text-white">今日任务</span>
        </div>
        <div className="space-y-3">
          {mockTasks.map((task, i) => (
            <div key={i} className="bg-[#1c1c1e] rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <h4 className="text-[15px] font-bold text-[#C9A84C]">{task.title}</h4>
                <div className="flex items-center gap-1 text-white/50 shrink-0 ml-2">
                  <Clock size={13} />
                  <span className="text-xs">{task.time}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
                {task.subtasks.map((s, si) => (
                  <span key={si} className="text-[13px] text-white/40 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-[11px] px-3 py-1 rounded-full font-medium ${priorityStyles[task.priority]}`}>
                  {task.priority}
                </span>
                <span className="text-xs text-white/50">
                  {task.done} / {task.total} 完成
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
