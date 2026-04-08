import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, Zap, FolderOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatProvider } from "@/contexts/ChatContext";

const tabs = [
  { path: "/m/chat", label: "对话", icon: MessageSquare },
  { path: "/m/meetings", label: "分身", icon: Zap },
  { path: "/m/knowledge", label: "知识库", icon: FolderOpen },
  { path: "/m/profile", label: "我的", icon: User },
];

export default function MobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  return (
    <ChatProvider>
      <div className="flex flex-col h-[100dvh] bg-black">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <nav className="shrink-0 border-t border-white/[0.06] bg-black safe-area-bottom">
          <div className="flex items-center justify-around h-14">
            {tabs.map(({ path, label, icon: Icon }) => {
              if (path === "__new__") {
                return (
                  <button
                    key={path}
                    onClick={() => navigate("/m/chat")}
                    className="flex items-center justify-center -mt-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30 active:scale-95 transition-transform">
                      <Plus size={24} className="text-black" strokeWidth={2.5} />
                    </div>
                  </button>
                );
              }

              const isActive = currentPath === path || (path === "/m/chat" && currentPath === "/m");
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                    isActive ? "text-amber-400" : "text-white/30"
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
    </ChatProvider>
  );
}
