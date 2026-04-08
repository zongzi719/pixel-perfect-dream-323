import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import MobileLayout from "./layout/MobileLayout";
import MobileLogin from "./pages/MobileLogin";
import MobileRegister from "./pages/MobileRegister";
import MobileChat from "./pages/MobileChat";
import MobileKnowledge from "./pages/MobileKnowledge";
import MobileMeetings from "./pages/MobileMeetings";
import MobileNotes from "./pages/MobileNotes";
import MobileProfile from "./pages/MobileProfile";

function MobileAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
  if (!user) return <Navigate to="/m/login" replace />;
  return <>{children}</>;
}

export default function MobileApp() {
  return (
    <Routes>
      <Route path="login" element={<MobileLogin />} />
      <Route path="register" element={<MobileRegister />} />
      <Route element={<MobileAuthGuard><MobileLayout /></MobileAuthGuard>}>
        <Route index element={<MobileChat />} />
        <Route path="chat" element={<MobileChat />} />
        <Route path="knowledge" element={<MobileKnowledge />} />
        <Route path="meetings" element={<MobileMeetings />} />
        <Route path="notes" element={<MobileNotes />} />
        <Route path="profile" element={<MobileProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/m" replace />} />
    </Routes>
  );
}
