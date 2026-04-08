import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LogOut, ChevronRight, User, Shield, HelpCircle } from "lucide-react";

export default function MobileProfile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/m/login");
  };

  const phone = user?.user_metadata?.phone || user?.email?.split("@")[0] || "用户";

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{phone}</h2>
            <p className="text-sm text-muted-foreground">普通用户</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="flex-1 px-4">
        <div className="bg-card rounded-xl overflow-hidden">
          {[
            { icon: User, label: "个人信息" },
            { icon: Shield, label: "账号安全" },
            { icon: HelpCircle, label: "帮助与反馈" },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex items-center w-full px-4 py-3.5 border-b border-border last:border-0 active:bg-muted/50">
              <Icon size={18} className="text-muted-foreground mr-3" />
              <span className="text-sm text-foreground flex-1 text-left">{label}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="w-full mt-4 h-12 rounded-xl border border-destructive/30 text-destructive text-sm font-medium active:bg-destructive/5 transition-colors"
        >
          <LogOut size={16} className="inline mr-2" />
          退出登录
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground/50 pb-6 pt-4">AI YOU v1.0</p>
    </div>
  );
}
