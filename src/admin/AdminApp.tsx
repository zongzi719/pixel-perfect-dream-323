import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "./layout/AdminLayout";
import { useAdminSession, useCurrentAdmin } from "./hooks/useAdminAuth";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import UserList from "./pages/UserList";
import UserDetail from "./pages/UserDetail";
import RoleList from "./pages/RoleList";
import Permissions from "./pages/Permissions";
import AdminManage from "./pages/AdminManage";
import AgentList from "./pages/AgentList";
import AgentCreate from "./pages/AgentCreate";
import ContentList from "./pages/ContentList";
import ContentDetail from "./pages/ContentDetail";
import NotesManage from "./pages/NotesManage";
import PriceConfig from "./pages/PriceConfig";
import PlanManage from "./pages/PlanManage";
import OrderList from "./pages/OrderList";
import UsageRecords from "./pages/UsageRecords";
import MemoryManage from "./pages/MemoryManage";
import { Loader2 } from "lucide-react";

function AdminGuard() {
  const { session, loading: sessionLoading } = useAdminSession();
  const { data: admin, isLoading: adminLoading } = useCurrentAdmin(session);

  if (sessionLoading || adminLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>;
  }

  if (!session || !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout />;
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminGuard />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserList />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="roles" element={<RoleList />} />
        <Route path="permissions" element={<Permissions />} />
        <Route path="admins" element={<AdminManage />} />
        <Route path="agents" element={<AgentList />} />
        <Route path="agents/new" element={<AgentCreate />} />
        <Route path="content" element={<ContentList />} />
        <Route path="content/:id" element={<ContentDetail />} />
        <Route path="notes-manage" element={<NotesManage />} />
        <Route path="billing/prices" element={<PriceConfig />} />
        <Route path="billing/plans" element={<PlanManage />} />
        <Route path="billing/orders" element={<OrderList />} />
        <Route path="billing/usage" element={<UsageRecords />} />
        <Route path="memory" element={<MemoryManage />} />
      </Route>
    </Routes>
  );
}
