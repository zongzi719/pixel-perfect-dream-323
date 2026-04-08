import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ChevronLeft, User, Pencil, Mail, Building2, Briefcase, Factory, CalendarDays } from "lucide-react";

const accountInfo = [
  { icon: Mail, label: "邮箱", value: "moumou@company.com" },
  { icon: Building2, label: "公司", value: "某某科技有限公司" },
  { icon: Briefcase, label: "职位", value: "创始人 & CEO" },
  { icon: Factory, label: "行业", value: "AI · 互联网 · SaaS" },
  { icon: CalendarDays, label: "已使用", value: "128 天" },
];

const aiCeoInfo = [
  { label: "当前绑定", value: "AI CEO · MOUMOU" },
  { label: "对齐率", value: "87%" },
  { label: "状态", value: "Lv.3 · 深度学习中" },
  { label: "最近更新", value: "2024-01-15" },
];

export default function MobileAccountCenter() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const phone = user?.user_metadata?.phone || user?.email?.split("@")[0] || "MOUMOU";

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Nav bar */}
      <div className="flex items-center px-4 pt-12 pb-3">
        <button onClick={() => navigate(-1)} className="mr-3">
          <ChevronLeft size={22} className="text-foreground" />
        </button>
        <span className="text-base font-semibold text-foreground">账户中心</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24">
        {/* User card */}
        <div className="bg-card rounded-2xl p-4 relative">
          <button className="absolute top-4 right-4">
            <Pencil size={14} className="text-[#C9A84C]" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#C9A84C]/15 flex items-center justify-center">
              <User size={28} className="text-[#C9A84C]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">{phone}</h2>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A84C]/10 text-[#C9A84C]/80">创始人·科技创业者</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A84C]/10 text-[#C9A84C]/80">AI·互联网·SaaS</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">AI 已学习 128 条记忆 · 对齐率 87%</p>
            </div>
          </div>
        </div>

        {/* 账号信息 */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-[#C9A84C]" />
            <span className="text-sm font-medium text-foreground">账号信息</span>
          </div>
          <div className="bg-card rounded-xl overflow-hidden">
            {accountInfo.map(({ icon: Icon, label, value }, i) => (
              <div key={i} className="flex items-center px-4 py-3 border-b border-border last:border-0">
                <Icon size={16} className="text-muted-foreground mr-3" />
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm text-foreground ml-auto">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI CEO 绑定 */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 rounded-full bg-[#C9A84C]" />
            <span className="text-sm font-medium text-foreground">AI CEO 绑定</span>
          </div>
          <div className="bg-card rounded-xl overflow-hidden">
            {aiCeoInfo.map(({ label, value }, i) => (
              <div key={i} className="flex items-center px-4 py-3 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="text-sm text-[#C9A84C] ml-auto">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-[#C9A84C] rounded-full" style={{ width: "60%" }} />
            </div>
            <span className="text-[10px] text-muted-foreground">Lv.3</span>
          </div>
        </div>

        {/* 继续优化 button */}
        <button className="w-full mt-6 h-12 rounded-xl bg-[#C9A84C] text-black text-sm font-semibold active:bg-[#C9A84C]/80 transition-colors">
          继续优化
        </button>
      </div>
    </div>
  );
}
