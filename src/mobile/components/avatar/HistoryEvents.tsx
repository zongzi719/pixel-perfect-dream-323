import { useState } from "react";
import { Search, Users, FileText, AlertCircle, CheckCircle2, Circle } from "lucide-react";

const categories = ["全部", "会议", "安排", "决策", "其他"] as const;

type EventItem = {
  icon: typeof Users;
  title: string;
  status: "progress" | "done";
};

const eventGroups: { label: string; items: EventItem[] }[] = [
  {
    label: "今天",
    items: [
      { icon: Users, title: "7月海外市场投流会议", status: "progress" },
      { icon: FileText, title: "8月关于app海外市场投流决策", status: "progress" },
      { icon: AlertCircle, title: "9月会议", status: "done" },
      { icon: Users, title: "10月海外市场安排", status: "done" },
    ],
  },
  {
    label: "昨天",
    items: [
      { icon: Users, title: "7月海外市场投流会议", status: "done" },
      { icon: FileText, title: "8月关于app海外市场投流决策", status: "done" },
    ],
  },
];

export default function HistoryEvents() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("全部");

  return (
    <>
      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索事项"
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

      {/* Event groups */}
      {eventGroups.map((group) => (
        <div key={group.label} className="mb-4">
          <h3 className="text-white font-bold text-[15px] mb-3">{group.label}</h3>
          <div className="space-y-2">
            {group.items.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-2xl bg-white/[0.06] p-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-white/50" />
                  </div>
                  <span className="flex-1 text-[14px] text-white">{item.title}</span>
                  {item.status === "done" ? (
                    <CheckCircle2 size={22} className="text-[#C9A84C] shrink-0" />
                  ) : (
                    <Circle size={22} className="text-white/20 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
