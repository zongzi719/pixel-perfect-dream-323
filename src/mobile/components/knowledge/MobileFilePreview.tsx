import { X, File, FileText, Tag } from "lucide-react";

interface FileInfo {
  id: string;
  title: string;
  type: "pdf" | "doc" | "meeting";
  date: string;
  preview?: string;
  size?: string;
  tags?: string[];
}

interface MobileFilePreviewProps {
  file: FileInfo;
  folderName: string;
  onClose: () => void;
}

const mockPreviewContent = {
  sections: [
    {
      title: "会议概览",
      points: [
        "讨论2025年Q1增长战略的三大核心方向",
        "确认AI数字化转型作为公司级战略优先级",
        "东南亚市场作为首个海外扩展目标",
      ],
    },
    {
      title: "核心决策",
      points: [
        "Q1预算分配：60%产品研发、25%市场拓展、15%运营优化",
        "组建东南亚市场专项小组，4月启动",
        "AI助手产品优先级提升至P0",
      ],
    },
    {
      title: "待办事项",
      points: [
        "完成东南亚市场调研报告（截止3月20日）",
        "制定AI助手产品路线图V2",
        "安排投资人沟通会议",
      ],
    },
  ],
};

export default function MobileFilePreview({ file, folderName, onClose }: MobileFilePreviewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Sheet */}
      <div
        className="relative w-full max-h-[85vh] bg-neutral-900 rounded-t-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Close */}
        <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center">
          <X size={16} className="text-white/60" />
        </button>

        <div className="flex-1 overflow-y-auto px-5 pb-8">
          {/* File Info Card */}
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${file.type === "pdf" ? "bg-red-500/15" : "bg-blue-500/15"}`}>
                {file.type === "pdf" ? (
                  <File size={22} className="text-red-400" />
                ) : (
                  <FileText size={22} className="text-blue-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{file.title}</p>
                {file.preview && (
                  <p className="text-xs text-white/40 mt-1 line-clamp-2">{file.preview}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  {file.size && <span className="text-xs text-white/30">{file.size}</span>}
                  <span className="text-xs" style={{ color: "#C9A84C" }}>{file.date}</span>
                </div>
                {file.tags && file.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <Tag size={10} className="text-white/30" />
                    {file.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-white/50">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Added to folder hint */}
          <p className="text-xs text-white/30 mb-4"># 已添加到{folderName}知识库</p>

          {/* Preview Content */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-full" style={{ backgroundColor: "#C9A84C" }} />
              <span className="text-sm font-medium text-white">预览模式</span>
            </div>

            {mockPreviewContent.sections.map((section, idx) => (
              <div key={idx} className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-4">
                <h4 className="text-sm font-medium text-white mb-2">{section.title}</h4>
                <ul className="space-y-1.5">
                  {section.points.map((point, pi) => (
                    <li key={pi} className="flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-white/30 mt-1.5 shrink-0" />
                      <span className="text-xs text-white/60 leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="flex gap-3 mt-6">
            <button className="flex-1 h-11 rounded-xl bg-white text-black text-sm font-medium">
              查看更多
            </button>
            <button className="flex-1 h-11 rounded-xl border border-white/20 text-white text-sm font-medium">
              修改
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
