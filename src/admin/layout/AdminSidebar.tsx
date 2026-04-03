import {
  LayoutDashboard,
  Users,
  Shield,
  KeyRound,
  UserCog,
  Bot,
  MessageSquare,
  StickyNote,
  CreditCard,
  Package,
  Receipt,
  BarChart3,
  Brain,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const menuGroups = [
  {
    label: "数据总览",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "用户管理",
    items: [
      { title: "用户列表", url: "/admin/users", icon: Users },
    ],
  },
  {
    label: "系统设置",
    items: [
      { title: "角色管理", url: "/admin/roles", icon: Shield },
      { title: "权限配置", url: "/admin/permissions", icon: KeyRound },
      { title: "管理员管理", url: "/admin/admins", icon: UserCog },
    ],
  },
  {
    label: "Agent管理",
    items: [
      { title: "Agent列表", url: "/admin/agents", icon: Bot },
      { title: "LLM 模型", url: "/admin/llm", icon: Brain },
    ],
  },
  {
    label: "内容管理",
    items: [
      { title: "对话记录", url: "/admin/content", icon: MessageSquare },
      { title: "笔记管理", url: "/admin/notes-manage", icon: StickyNote },
    ],
  },
  {
    label: "计费系统",
    items: [
      { title: "价格配置", url: "/admin/billing/prices", icon: CreditCard },
      { title: "套餐管理", url: "/admin/billing/plans", icon: Package },
      { title: "订单列表", url: "/admin/billing/orders", icon: Receipt },
      { title: "消费记录", url: "/admin/billing/usage", icon: BarChart3 },
    ],
  },
  {
    label: "记忆管理",
    items: [
      { title: "用户记忆", url: "/admin/memory", icon: Brain },
    ],
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/admin/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-neutral-800 bg-neutral-950">
      <SidebarHeader className="border-b border-neutral-800 p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-neutral-900 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">AI</span>
          </div>
          {!collapsed && (
            <span className="text-base font-semibold text-neutral-100">AI YOU Admin</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-neutral-950">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-neutral-500 text-xs uppercase tracking-wider">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname === item.url ||
                    (item.url !== "/admin" && location.pathname.startsWith(item.url + "/"));
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/admin"}
                          className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                            isActive
                              ? "bg-white text-neutral-950 font-medium"
                              : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                          }`}
                          activeClassName=""
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-neutral-800 bg-neutral-950 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-800"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!collapsed && <span>退出登录</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
