import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ChevronLeft, User, Pencil, MessageSquare, Building2, Landmark, Layers, CalendarDays } from "lucide-react";

const accountInfo = [
  { icon: MessageSquare, label: "邮箱", value: "moumou@email.com" },
  { icon: Building2, label: "公司", value: "MouMou Studio" },
  { icon: Landmark, label: "职位", value: "创始人" },
  { icon: Layers, label: "行业", value: "AI / SaaS" },
  { icon: CalendarDays, label: "已使用", value: "36 天" },
];

const aiCeoInfo = [
  { label: "当前绑定名称", value: "AI CEO — MouMou" },
  { label: "对齐率", value: "65%" },
  { label: "状态", value: null, hasProgress: true },
  { label: "最近更新", value: "30分钟前" },
];

export default function MobileAccountCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const phone = user?.user_metadata?.phone || user?.email?.split("@")[0] || "MOUMOU";

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Nav bar */}
      <div className="flex items-center px-5" style={{ paddingTop: "env(safe-area-inset-top, 44px)" }}>
        <button onClick={() => navigate(-1)} className="mr-4 pt-4 pb-3">
          <ChevronLeft size={22} className="text-white" />
        </button>
        <span className="text-base font-semibold text-white pt-4 pb-3 flex-1 text-center mr-8">账户中心</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24">
        {/* User card */}
        <div className="bg-[#1c1c1e] rounded-2xl p-5 mt-4 relative">
          <button className="absolute top-4 right-4">
            <Pencil size={16} className="text-[#C9A84C]" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-200 to-cyan-400 flex items-center justify-center overflow-hidden shrink-0">
              <User size={36} className="text-cyan-800" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{phone}</h2>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-white/60 border border-white/10">创始人 · 科技创业者</span>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 text-white/60 border border-white/10">AI · 互联网 · SaaS</span>
              </div>
              <p className="text-[11px] text-white/35 mt-1.5">AI学习数据 – 35份资料 · 2.5小时访谈</p>
            </div>
          </div>
        </div>

        {/* 账号信息 */}
        <div className="mt-6">
          <p className="text-sm text-white/60 mb-3 px-1">账号信息</p>
          <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden">
            {accountInfo.map(({ icon: Icon, label, value }, i) => (
              <div key={i} className="flex items-center px-5 py-4 border-b border-white/5 last:border-0">
                <Icon size={18} className="text-white/30 mr-3.5" />
                <span className="text-[14px] text-white/50">{label}</span>
                <span className="text-[14px] text-white ml-auto">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI CEO 绑定 */}
        <div className="mt-6">
          <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden px-5 py-1">
            {aiCeoInfo.map(({ label, value, hasProgress }, i) => (
              <div key={i} className="flex items-center py-4 border-b border-white/5 last:border-0">
                <span className="text-[14px] text-white/50">{label}</span>
                <div className="ml-auto flex items-center gap-2">
                  {hasProgress ? (
                    <>
                      <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#C9A84C] rounded-full" style={{ width: "40%" }} />
                      </div>
                      <span className="text-[14px] text-white">Lv.3</span>
                    </>
                  ) : (
                    <span className="text-[14px] text-white">{value}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 继续优化 button */}
        <button className="w-full mt-6 h-12 rounded-full bg-[#C9A84C] text-white text-sm font-semibold active:bg-[#C9A84C]/80 transition-colors">
          继续优化
        </button>
      </div>
    </div>
  );
}
