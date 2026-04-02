import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModeProvider } from "@/contexts/ModeContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import KnowledgeBase from "./pages/KnowledgeBase.tsx";
import MeetingMinutes from "./pages/MeetingMinutes.tsx";
import InspirationNotes from "./pages/InspirationNotes.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import AdminApp from "./admin/AdminApp";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/admin/*" element={<AdminApp />} />
    <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
    <Route path="/knowledge" element={<AuthGuard><KnowledgeBase /></AuthGuard>} />
    <Route path="/meetings" element={<AuthGuard><MeetingMinutes /></AuthGuard>} />
    <Route path="/notes" element={<AuthGuard><InspirationNotes /></AuthGuard>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ModeProvider>
        <ChatProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ChatProvider>
      </ModeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
