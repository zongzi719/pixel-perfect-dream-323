import { Routes, Route } from "react-router-dom";
import { AdminLayout } from "./layout/AdminLayout";
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

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
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
