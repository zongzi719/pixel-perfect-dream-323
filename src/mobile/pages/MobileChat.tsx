import { MessageSquare } from "lucide-react";

export default function MobileChat() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <MessageSquare size={28} className="text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">AI 对话</h2>
      <p className="text-sm text-muted-foreground mt-2">对话功能将在下一批实现</p>
    </div>
  );
}
