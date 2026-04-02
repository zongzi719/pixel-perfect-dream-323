import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLocation } from "react-router-dom";

const routeTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "用户管理",
  "/admin/roles": "角色管理",
  "/admin/permissions": "权限配置",
  "/admin/admins": "管理员管理",
  "/admin/agents": "Agent管理",
  "/admin/agents/new": "创建Agent",
  "/admin/content": "对话记录",
  "/admin/notes-manage": "笔记管理",
  "/admin/billing/prices": "价格配置",
  "/admin/billing/plans": "套餐管理",
  "/admin/billing/orders": "订单列表",
  "/admin/billing/usage": "消费记录",
  "/admin/memory": "用户记忆",
};

export function AdminHeader() {
  const location = useLocation();
  const title = routeTitles[location.pathname] || "管理后台";

  return (
    <header className="h-14 flex items-center justify-between border-b border-neutral-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-neutral-600 hover:text-neutral-900" />
        <h1 className="text-lg font-semibold text-neutral-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-500">管理员A</span>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-neutral-900 text-white text-xs">A</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
