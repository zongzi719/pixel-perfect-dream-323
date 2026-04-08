import { useState } from "react";
import HistoryDocuments from "./HistoryDocuments";
import UserMemories from "./UserMemories";
import HistoryEvents from "./HistoryEvents";

const subTabs = ["历史文档", "用户记忆", "历史事项"] as const;

export default function MemoryLibrary() {
  const [active, setActive] = useState<string>("历史文档");

  return (
    <div className="px-4 pb-6">
      {/* Sub-tab pills */}
      <div className="flex items-center gap-1 bg-white/[0.06] rounded-full p-1 mb-4">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`flex-1 text-[13px] py-2 rounded-full text-center transition-all ${
              active === tab
                ? "bg-white text-black font-semibold"
                : "text-white/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {active === "历史文档" && <HistoryDocuments />}
      {active === "用户记忆" && <UserMemories />}
      {active === "历史事项" && <HistoryEvents />}
    </div>
  );
}
