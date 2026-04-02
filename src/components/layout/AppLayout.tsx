import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ModeSelector } from '@/components/mode/ModeSelector';
import { useMode } from '@/contexts/ModeContext';
import { useChat } from '@/contexts/ChatContext';
import { WelcomeScreen } from '@/components/chat/WelcomeScreen';
import { ChatArea } from '@/components/chat/ChatArea';
import { ChatInput } from '@/components/chat/ChatInput';
import { DecisionWelcome } from '@/components/decision/DecisionWelcome';
import { CoachPanel } from '@/components/decision/CoachPanel';

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { mode } = useMode();
  const { currentConversation, decisionStarted } = useChat();

  const showWelcome = mode === 'private' && (!currentConversation || currentConversation.messages.length === 0);
  const showDecisionWelcome = mode === 'decision' && !decisionStarted;
  const showChat = mode === 'private' && currentConversation && currentConversation.messages.length > 0;
  const showDecisionChat = mode === 'decision' && decisionStarted;

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-secondary/30 to-background">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar with mode selector */}
        <header className="flex items-center justify-center py-3 px-4 relative">
          <ModeSelector />
          {showDecisionChat && (
            <div className="absolute right-4">
              <CoachPanel />
            </div>
          )}
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {showWelcome && <WelcomeScreen />}
          {showDecisionWelcome && <DecisionWelcome />}
          {showChat && <ChatArea />}
          {showDecisionChat && <ChatArea />}

          {/* Input */}
          {(showWelcome || showChat || showDecisionChat) && (
            <div className="px-4 pb-4">
              <ChatInput />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
