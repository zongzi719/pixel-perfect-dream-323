import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, FolderOpen, Mic, Lightbulb, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { path: "/m/chat", label: "对话", icon: MessageSquare },
  { path: "/m/knowledge", label: "知识库", icon: FolderOpen },
  { path: "/m/meetings", label: "会议", icon: Mic },
  { path: "/m/notes", label: "笔记", icon: Lightbulb },
  { path: "/m/profile", label: "我的", icon: User },
];

export default function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom tab bar */}
      <nav className="shrink-0 border-t border-border bg-card safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          {tabs.map(({ path, label, icon: Icon }) => {
            const isActive = currentPath === path || (path === "/m/chat" && currentPath === "/m");
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
