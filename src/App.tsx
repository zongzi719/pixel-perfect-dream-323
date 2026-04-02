import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ModeProvider } from "@/contexts/ModeContext";
import { ChatProvider } from "@/contexts/ChatContext";
import Index from "./pages/Index.tsx";
import KnowledgeBase from "./pages/KnowledgeBase.tsx";
import MeetingMinutes from "./pages/MeetingMinutes.tsx";
import InspirationNotes from "./pages/InspirationNotes.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import AdminApp from "./admin/AdminApp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ModeProvider>
        <ChatProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/knowledge" element={<KnowledgeBase />} />
              <Route path="/meetings" element={<MeetingMinutes />} />
              <Route path="/notes" element={<InspirationNotes />} />
              <Route path="/admin/*" element={<AdminApp />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ChatProvider>
      </ModeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
