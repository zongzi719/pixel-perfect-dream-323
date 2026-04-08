import { Routes, Route, Navigate } from "react-router-dom";
import MobileMeetingDetail from "./components/knowledge/MobileMeetingDetail";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import MobileLayout from "./layout/MobileLayout";
import MobileSplash from "./pages/MobileSplash";
import MobileLogin from "./pages/MobileLogin";
import MobileRegister from "./pages/MobileRegister";
import MobileChat from "./pages/MobileChat";
import MobileKnowledge from "./pages/MobileKnowledge";
import MobileMeetings from "./pages/MobileMeetings";
import MobileNotes from "./pages/MobileNotes";
import MobileProfile from "./pages/MobileProfile";
import MobileOnboarding from "./pages/onboarding/MobileOnboarding";

function MobileAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading || !user) {
      setCheckingOnboarding(false);
      return;
    }
    supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setOnboardingCompleted((data as any)?.onboarding_completed ?? false);
        setCheckingOnboarding(false);
      });
  }, [user, loading]);

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white/40" />
      </div>
    );
  }
  if (!user) return <Navigate to="/m/splash" replace />;
  if (onboardingCompleted === false) return <Navigate to="/m/onboarding" replace />;
  return <>{children}</>;
}

export default function MobileApp() {
  return (
    <Routes>
      <Route path="splash" element={<MobileSplash />} />
      <Route path="login" element={<MobileLogin />} />
      <Route path="register" element={<MobileRegister />} />
      <Route path="onboarding" element={<MobileOnboarding />} />
      <Route element={<MobileAuthGuard><MobileLayout /></MobileAuthGuard>}>
        <Route index element={<MobileChat />} />
        <Route path="chat" element={<MobileChat />} />
        <Route path="knowledge" element={<MobileKnowledge />} />
        <Route path="knowledge/meeting/:id" element={<MobileMeetingDetail />} />
        <Route path="meetings" element={<MobileMeetings />} />
        <Route path="notes" element={<MobileNotes />} />
        <Route path="profile" element={<MobileProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/m" replace />} />
    </Routes>
  );
}
