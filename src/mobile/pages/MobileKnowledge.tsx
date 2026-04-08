import { FolderOpen } from "lucide-react";

export default function MobileKnowledge() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <FolderOpen size={28} className="text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">知识库</h2>
      <p className="text-sm text-muted-foreground mt-2">知识库功能将在后续批次实现</p>
    </div>
  );
}
