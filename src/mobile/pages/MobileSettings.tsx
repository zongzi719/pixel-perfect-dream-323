import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ChevronLeft, ChevronRight, Bell, Lock, Trash2, Info, LogOut } from "lucide-react";

const sections = [
  {
    title: "通用",
    items: [{ icon: Bell, label: "通知" }],
  },
  {
    title: "隐私与安全",
    items: [
      { icon: Lock, label: "修改密码" },
      { icon: Trash2, label: "清除缓存" },
    ],
  },
  {
    title: "关于",
    items: [{ icon: Info, label: "关于本应用" }],
  },
];

export default function MobileSettings() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/m/login");
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Nav bar */}
      <div className="flex items-center px-4 pt-12 pb-3">
        <button onClick={() => navigate(-1)} className="mr-3">
          <ChevronLeft size={22} className="text-foreground" />
        </button>
        <span className="text-base font-semibold text-foreground">设置</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24">
        {sections.map((section, si) => (
          <div key={si} className="mt-5">
            <p className="text-xs text-muted-foreground mb-2 px-1">{section.title}</p>
            <div className="bg-card rounded-xl overflow-hidden">
              {section.items.map(({ icon: Icon, label }, ii) => (
                <button
                  key={ii}
                  className="flex items-center w-full px-4 py-3.5 border-b border-border last:border-0 active:bg-muted/50"
                >
                  <Icon size={16} className="text-muted-foreground mr-3" />
                  <span className="text-sm text-foreground flex-1 text-left">{label}</span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="px-5 pb-8">
        <button
          onClick={handleLogout}
          className="w-full h-12 rounded-xl bg-[#C9A84C] text-black text-sm font-semibold flex items-center justify-center gap-2 active:bg-[#C9A84C]/80 transition-colors"
        >
          <LogOut size={16} />
          退出登录
        </button>
      </div>
    </div>
  );
}
