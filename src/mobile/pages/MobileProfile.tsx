import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Settings, User, Clock, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { useState, useRef } from "react";

const mockTodos = [
  { id: "1", text: "审核Q3战略规划文档并给出修改建议", done: false },
  { id: "2", text: "准备下周一投资人会议的核心数据", done: false },
  { id: "3", text: "完成新产品定价方案的最终确认", done: true },
  { id: "4", text: "Review团队周报并反馈关键问题", done: false },
  { id: "5", text: "确认本月营销预算分配方案", done: true },
];

const mockTasks = [
  {
    title: "Q3战略规划会议",
    time: "14:00 - 15:30",
    subtasks: ["确认参会人员名单", "准备数据报告", "整理历史决策记录"],
    priority: "核心" as const,
    done: 2,
    total: 3,
  },
  {
    title: "产品迭代评审",
    time: "16:00 - 17:00",
    subtasks: ["收集用户反馈数据", "对比竞品功能更新"],
    priority: "重要" as const,
    done: 1,
    total: 2,
  },
  {
    title: "团队周会纪要整理",
    time: "10:00 - 10:30",
    subtasks: ["汇总各部门进展", "标记待跟进事项", "同步至知识库"],
    priority: "次要" as const,
    done: 3,
    total: 3,
  },
];

const priorityStyles: Record<string, string> = {
  核心: "bg-[#C9A84C]/20 text-[#C9A84C]",
  重要: "bg-[#A08535]/20 text-[#C9A84C]/80",
  次要: "bg-[#C9A84C]/10 text-[#C9A84C]/50",
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
    const next = Math.max(-100, Math.min(0, currentOffset.current + diff));
    setOffset(next);
  };
  const handleTouchEnd = () => {
    setOffset(offset < -50 ? -100 : 0);
  };

  return (
    <div className="relative overflow-hidden rounded-lg mb-2">
      {/* Actions behind */}
      <div className="absolute right-0 top-0 bottom-0 flex items-stretch" style={{ width: 100 }}>
        <button className="flex-1 flex items-center justify-center bg-[#C9A84C]/20">
          <Pencil size={16} className="text-[#C9A84C]" />
        </button>
        <button className="flex-1 flex items-center justify-center bg-destructive/20">
          <Trash2 size={16} className="text-destructive" />
        </button>
      </div>
      {/* Foreground */}
      <div
        className="relative bg-card px-4 py-3 flex items-center gap-3 transition-transform"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <span className={`flex-1 text-sm ${item.done ? "line-through text-muted-foreground/50" : "text-foreground"}`}>
          {item.text}
        </span>
        <button onClick={onToggle} className="shrink-0">
          {item.done ? (
            <CheckCircle2 size={20} className="text-muted-foreground/40" />
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-[#C9A84C]/60" />
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

  const doneCount = todos.filter((t) => t.done).length;
  const totalCount = todos.length;
  const pct = Math.round((doneCount / totalCount) * 100);
  const phone = user?.user_metadata?.phone || user?.email?.split("@")[0] || "MOUMOU";

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto pb-24">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-2">
        <span className="text-lg font-semibold text-[#C9A84C]">我的</span>
        <button onClick={() => navigate("/m/settings")}>
          <Settings size={20} className="text-muted-foreground" />
        </button>
      </div>

      {/* User card */}
      <button onClick={() => navigate("/m/account")} className="mx-5 mt-2 bg-card rounded-2xl p-4 flex items-center gap-4 active:bg-muted/50 text-left">
        <div className="w-14 h-14 rounded-full bg-[#C9A84C]/15 flex items-center justify-center shrink-0">
          <User size={24} className="text-[#C9A84C]" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-foreground">{phone}</h2>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A84C]/10 text-[#C9A84C]/80">创始人·科技创业者</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A84C]/10 text-[#C9A84C]/80">AI·互联网·SaaS</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">AI 已学习 128 条记忆 · 对齐率 87%</p>
        </div>
      </button>

      {/* 待处理事务 */}
      <div className="mx-5 mt-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full bg-[#C9A84C]" />
          <span className="text-sm font-medium text-foreground">待处理事务</span>
          <span className="text-sm font-semibold text-[#C9A84C] ml-auto">{pct}%</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-[#C9A84C] rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{doneCount}/{totalCount}</span>
        </div>
      </div>

      {/* 今日重点事项 */}
      <div className="mx-5 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full bg-[#C9A84C]" />
          <span className="text-sm font-medium text-foreground">今日重点事项</span>
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
      <div className="mx-5 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full bg-[#C9A84C]" />
          <span className="text-sm font-medium text-foreground">今日任务</span>
        </div>
        <div className="space-y-3">
          {mockTasks.map((task, i) => (
            <div key={i} className="bg-card rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-[#C9A84C]">{task.title}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${priorityStyles[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                <Clock size={12} />
                <span className="text-xs">{task.time}</span>
              </div>
              <ul className="space-y-1 mb-3">
                {task.subtasks.map((s, si) => (
                  <li key={si} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C9A84C]/60 rounded-full"
                    style={{ width: `${(task.done / task.total) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {task.done}/{task.total} 完成
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
