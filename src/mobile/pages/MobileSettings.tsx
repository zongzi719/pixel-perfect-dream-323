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
    <div className="flex flex-col h-full bg-black">
      {/* Nav bar */}
      <div className="flex items-center px-5" style={{ paddingTop: "env(safe-area-inset-top, 44px)" }}>
        <button onClick={() => navigate(-1)} className="mr-4 pt-4 pb-3">
          <ChevronLeft size={22} className="text-white" />
        </button>
        <span className="text-base font-semibold text-white pt-4 pb-3 flex-1 text-center mr-8">设置</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {sections.map((section, si) => (
          <div key={si} className="mt-6">
            <p className="text-sm text-white/50 mb-2.5 px-1">{section.title}</p>
            <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden">
              {section.items.map(({ icon: Icon, label }, ii) => (
                <button
                  key={ii}
                  className="flex items-center w-full px-5 py-4 border-b border-white/5 last:border-0 active:bg-white/5"
                >
                  <Icon size={18} className="text-white/50 mr-3.5" />
                  <span className="text-[14px] text-white flex-1 text-left">{label}</span>
                  <ChevronRight size={18} className="text-white/30" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="px-5 pb-10">
        <button
          onClick={handleLogout}
          className="w-full h-12 rounded-full bg-[#C9A84C] text-white text-sm font-semibold flex items-center justify-center gap-2 active:bg-[#C9A84C]/80 transition-colors"
        >
          <LogOut size={16} />
          退出登录
        </button>
      </div>
    </div>
  );
}
