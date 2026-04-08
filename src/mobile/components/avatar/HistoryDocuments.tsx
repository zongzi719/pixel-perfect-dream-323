import { useState } from "react";
import { Search, MoreHorizontal, X } from "lucide-react";

const mockDocs = [
  { id: "1", title: "2026AI基地业务战略会_原文", preview: "2026AI基地业务战略会正文 2026年02月24日 12：03 --发言人 00：00...", date: "2026-02-24 16:09", type: "PDF" as const },
  { id: "2", title: "2026AI基地业务战略会_原文", preview: "2026AI基地业务战略会正文 2026年02月24日 12：03 --发言人 00：00...", date: "2026-02-24 16:09", type: "Word" as const },
  { id: "3", title: "2026AI基地业务战略会_原文", preview: "2026AI基地业务战略会正文 2026年02月24日 12：03 --发言人 00：00...", date: "2026-02-24 16:09", type: "PDF" as const },
];

const mockDetail = {
  title: "东南亚市场进入策略.docx",
  preview: "2026AI基地业务战略会正文 2026年02月24日 12：03 --发言人 00：00...",
  size: "12MB",
  date: "2026-02-24 16:09",
  tag: "AI战略分析报告",
  type: "Word" as const,
  linkedKb: "#已添加到行业报告等一个知识库",
  content: `🖥 会议概览
时间：2026-03-17 09:56-10:53（57分钟）
参会人：Steve（船长）、单鑫铭、冯泽颖、Jason、万星、无涯、张思哲
🎯 核心决策
产品交互稿过稿
简化用户流程：三步走
上传头像生成分身
录入60秒声音
完成对话
双模式设计：
AI分身模式：学习用户语调和语气，过滤无意义信息
教练模式：多个教练可选，根据分身等级解锁
记忆系统：ACO画像，记忆微调可随时对话学习
交互优化：AI自动语义解析生成待办事项
品牌设计优化：icon、字体、logo（周六加班完成）
技术架构
需明确云端/本地部署组件（待绘制架构图）
记忆架构暂缓，待小鹏review后单独讨论`,
};

export default function HistoryDocuments() {
  const [search, setSearch] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const typeColor = (t: string) => (t === "PDF" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400");

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

      <div className="flex items-center justify-between mb-4">
        <span className="text-white font-bold text-[15px]">近30天</span>
        <button className="text-[12px] text-white/40 px-3 py-1 rounded-full bg-white/[0.06]">只显示标题</button>
      </div>

      {/* Document list */}
      <div className="space-y-3">
        {mockDocs.map((doc) => (
          <button
            key={doc.id}
            onClick={() => setSelectedDoc(doc.id)}
            className="w-full text-left rounded-2xl bg-white/[0.06] overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-red-400/60 to-red-400/20" />
            <div className="p-4 flex gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-[14px] font-semibold text-white truncate">{doc.title}</h4>
                <p className="text-[12px] text-white/40 mt-1.5 line-clamp-2">{doc.preview}</p>
                <p className="text-[11px] text-white/30 mt-2">{doc.date}</p>
              </div>
              <div className="flex flex-col items-end justify-between shrink-0">
                <MoreHorizontal size={16} className="text-white/30" />
                <div className={`text-[11px] font-bold px-3 py-2 rounded-lg ${typeColor(doc.type)}`}>
                  {doc.type}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Document preview modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end">
          <div className="w-full bg-[#1a1a1a] rounded-t-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <span className="text-white font-semibold">预览</span>
              <button onClick={() => setSelectedDoc(null)}>
                <X size={20} className="text-white/60" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-5">
              {/* File info card */}
              <div className="rounded-2xl bg-white/[0.06] p-4 mb-4">
                <h3 className="text-white font-bold text-[15px]">{mockDetail.title}</h3>
                <p className="text-[12px] text-white/40 mt-1">{mockDetail.preview}</p>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-[11px] text-white/30">{mockDetail.size}</span>
                    <p className="text-[#C9A84C] text-[12px] font-semibold mt-0.5">{mockDetail.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/40">{mockDetail.tag}</span>
                    <div className={`text-[11px] font-bold px-3 py-2 rounded-lg ${typeColor(mockDetail.type)}`}>
                      {mockDetail.type}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-[#C9A84C]/60 mb-4">{mockDetail.linkedKb}</p>

              <div className="text-[#C9A84C] font-semibold text-sm mb-3 flex items-center gap-1">
                <span className="w-1 h-4 bg-[#C9A84C] rounded-full" />
                预览模式
              </div>

              <div className="text-[13px] text-white/70 leading-relaxed whitespace-pre-line">
                {mockDetail.content}
              </div>
            </div>

            <div className="flex gap-3 px-5 pb-8 pt-3 border-t border-white/[0.06]">
              <button className="flex-1 h-12 rounded-2xl bg-white text-black font-semibold text-sm">查看更多</button>
              <button className="flex-1 h-12 rounded-2xl bg-black border border-white/20 text-white font-semibold text-sm">修改</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
