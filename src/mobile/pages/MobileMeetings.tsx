import { useState } from "react";
import { Star } from "lucide-react";
import AiCeoProfile from "../components/avatar/AiCeoProfile";
import MemoryLibrary from "../components/avatar/MemoryLibrary";

const mainTabs = ["AI CEO", "记忆库"] as const;

export default function MobileMeetings() {
  const [activeTab, setActiveTab] = useState<string>("AI CEO");

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Top header */}
      <div className="flex items-center justify-between px-4 pt-14 pb-2">
        <div className="flex items-center gap-4">
          {mainTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-lg font-bold transition-colors ${
                activeTab === tab ? "text-[#C9A84C]" : "text-white/30"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === "AI CEO" && (
          <button className="flex items-center gap-1 text-[12px] text-[#C9A84C] bg-[#C9A84C]/10 px-3 py-1.5 rounded-full">
            <Star size={12} className="text-[#C9A84C]" />
            记忆微调
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "AI CEO" ? <AiCeoProfile /> : <MemoryLibrary />}
      </div>
    </div>
  );
}
