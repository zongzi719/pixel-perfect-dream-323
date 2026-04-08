import { useState } from "react";
import { Search, MoreHorizontal, FileText, File, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import MobileFilePreview from "@/mobile/components/knowledge/MobileFilePreview";
import { useNavigate } from "react-router-dom";

interface KnowledgeFolder {
  id: string;
  name: string;
  type: "docs" | "meetings" | "product";
  count: number;
  color: string;
}

interface KnowledgeItem {
  id: string;
  title: string;
  type: "pdf" | "doc" | "meeting";
  folderId: string;
  date: string;
  creator?: string;
  preview?: string;
  size?: string;
  tags?: string[];
  owned?: boolean;
  shared?: boolean;
}

const folders: KnowledgeFolder[] = [
  { id: "strategy", name: "战略资料", type: "docs", count: 12, color: "#C9A84C" },
  { id: "meetings", name: "会议记录", type: "meetings", count: 18, color: "#6B8AFF" },
  { id: "product", name: "产品文档", type: "product", count: 8, color: "#4ECDC4" },
];

const mockItems: KnowledgeItem[] = [
  { id: "k1", title: "2025-Q1 增长战略规划手册", type: "pdf", folderId: "strategy", date: "3月11日", preview: "本文档详细阐述了公司2025年第一季度的增长战略，涵盖市场扩展、产品创新和客户获取三大核心领域...", size: "2.4MB", tags: ["战略", "Q1"], owned: true },
  { id: "k2", title: "AI数字增长战略和核心价值...", type: "doc", folderId: "strategy", date: "3月10日", preview: "AI技术在企业数字化转型中的核心价值分析，包括效率提升、成本优化和创新驱动三个维度...", size: "1.8MB", tags: ["AI", "战略"], owned: true },
  { id: "k3", title: "竞品分析报告-东南亚市场", type: "pdf", folderId: "strategy", date: "3月8日", preview: "东南亚市场主要竞争对手分析，包括市场份额、产品特点、定价策略等方面的对比研究...", size: "3.1MB", tags: ["竞品", "市场"], shared: true },
  { id: "k4", title: "投资人沟通材料V3", type: "doc", folderId: "strategy", date: "3月5日", size: "4.2MB", tags: ["融资"], owned: true },
  { id: "m1", title: "AI数字增长战略和核心价值讨论", type: "meeting", folderId: "meetings", date: "3月12日", creator: "张明", owned: true },
  { id: "m2", title: "产品路线图评审会议", type: "meeting", folderId: "meetings", date: "3月10日", creator: "李华", owned: true },
  { id: "m3", title: "客户反馈分析讨论", type: "meeting", folderId: "meetings", date: "3月8日", creator: "王芳", shared: true },
  { id: "m4", title: "技术架构升级方案评审", type: "meeting", folderId: "meetings", date: "3月6日", creator: "陈强", shared: true },
  { id: "p1", title: "产品需求文档PRD-V2.1", type: "pdf", folderId: "product", date: "3月11日", size: "1.5MB", tags: ["PRD"], owned: true },
  { id: "p2", title: "用户体验设计规范", type: "doc", folderId: "product", date: "3月9日", size: "2.8MB", tags: ["设计"], owned: true },
];

const subTabs = ["全部", "我创建的", "我分享的"] as const;

export default function MobileKnowledge() {
  const navigate = useNavigate();
  const [selectedFolder, setSelectedFolder] = useState<string>("strategy");
  const [subTab, setSubTab] = useState<typeof subTabs[number]>("全部");
  const [search, setSearch] = useState("");
  const [showBody, setShowBody] = useState(false);
  const [previewFile, setPreviewFile] = useState<KnowledgeItem | null>(null);

  const currentFolder = folders.find(f => f.id === selectedFolder);
  const isMeetingFolder = currentFolder?.type === "meetings";

  const filteredItems = mockItems.filter(item => {
    if (item.folderId !== selectedFolder) return false;
    if (search && !item.title.includes(search)) return false;
    if (subTab === "我创建的" && !item.owned) return false;
    if (subTab === "我分享的" && !item.shared) return false;
    return true;
  });

  const handleItemClick = (item: KnowledgeItem) => {
    if (item.type === "meeting") {
      navigate(`/m/knowledge/meeting/${item.id}`);
    } else {
      setPreviewFile(item);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-3">
        <h1 className="text-xl font-bold" style={{ color: "#C9A84C" }}>知识库</h1>
        <button className="w-8 h-8 flex items-center justify-center rounded-full">
          <MoreHorizontal size={20} className="text-white/50" />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 pb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索文件..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
          />
        </div>
      </div>

      {/* Folder Cards - Horizontal Scroll */}
      <div className="px-5 pb-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {folders.map((folder) => {
            const isActive = selectedFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => { setSelectedFolder(folder.id); setSubTab("全部"); }}
                className={cn(
                  "shrink-0 w-28 rounded-2xl p-3 transition-all relative overflow-hidden",
                  isActive
                    ? "bg-white/[0.12] border border-white/[0.15]"
                    : "bg-white/[0.04] border border-white/[0.06]"
                )}
              >
                {/* Stacked docs effect */}
                <div className="relative w-12 h-14 mx-auto mb-2">
                  <div className="absolute inset-x-2 top-0 h-10 rounded-md bg-white/[0.06] rotate-[-3deg]" />
                  <div className="absolute inset-x-1 top-1 h-10 rounded-md bg-white/[0.08] rotate-[2deg]" />
                  <div
                    className="absolute inset-0 top-2 h-10 rounded-md flex items-center justify-center"
                    style={{ backgroundColor: `${folder.color}20` }}
                  >
                    {folder.type === "meetings" ? (
                      <Mic size={16} style={{ color: folder.color }} />
                    ) : (
                      <FileText size={16} style={{ color: folder.color }} />
                    )}
                  </div>
                </div>
                <p className="text-xs text-center text-white/80 truncate">{folder.name}</p>
                <p className="text-[10px] text-center text-white/30 mt-0.5">{folder.count}个文件</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="px-5 pb-3">
        <div className="flex gap-2">
          {subTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setSubTab(tab)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-colors",
                subTab === tab
                  ? "bg-white text-black"
                  : "bg-white/[0.06] text-white/50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* List Header */}
      <div className="flex items-center justify-between px-5 pb-2">
        <span className="text-xs text-white/40">近30天</span>
        {!isMeetingFolder && (
          <button
            onClick={() => setShowBody(!showBody)}
            className="flex items-center gap-1.5"
          >
            <span className="text-xs text-white/40">显示正文</span>
            <div className={cn(
              "w-8 h-4 rounded-full transition-colors relative",
              showBody ? "bg-amber-500" : "bg-white/[0.12]"
            )}>
              <div className={cn(
                "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform",
                showBody ? "left-4.5 translate-x-0" : "left-0.5"
              )} style={showBody ? { left: "17px" } : { left: "2px" }} />
            </div>
          </button>
        )}
      </div>

      {/* File/Meeting List */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <div className="space-y-2">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="w-full text-left rounded-2xl bg-white/[0.04] border border-white/[0.06] p-4 active:bg-white/[0.08] transition-colors"
            >
              {item.type === "meeting" ? (
                /* Meeting item */
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(201,168,76,0.15)" }}>
                    <Mic size={18} style={{ color: "#C9A84C" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    <p className="text-xs text-white/40 mt-1">{item.creator} @{item.date}</p>
                  </div>
                  <button className="shrink-0 mt-1" onClick={e => e.stopPropagation()}>
                    <MoreHorizontal size={16} className="text-white/30" />
                  </button>
                </div>
              ) : (
                /* Document item */
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    item.type === "pdf" ? "bg-red-500/15" : "bg-blue-500/15"
                  )}>
                    {item.type === "pdf" ? (
                      <File size={18} className="text-red-400" />
                    ) : (
                      <FileText size={18} className="text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    {showBody && item.preview && (
                      <p className="text-xs text-white/40 mt-1 line-clamp-2">{item.preview}</p>
                    )}
                    <p className="text-xs text-white/30 mt-1">{item.date}{item.size ? ` · ${item.size}` : ""}</p>
                  </div>
                  <button className="shrink-0 mt-1" onClick={e => e.stopPropagation()}>
                    <MoreHorizontal size={16} className="text-white/30" />
                  </button>
                </div>
              )}
            </button>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-white/30 text-sm">暂无文件</div>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <MobileFilePreview
          file={previewFile}
          folderName={currentFolder?.name || ""}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}
