import { useState, useCallback } from 'react';
import { Menu, Sparkles } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { streamChat } from '@/lib/streamChat';
import { toast } from 'sonner';
import MobileChatWelcome from '../components/chat/MobileChatWelcome';
import MobileChatMessages from '../components/chat/MobileChatMessages';
import MobileChatInput from '../components/chat/MobileChatInput';
import MobileVoicePanel from '../components/chat/MobileVoicePanel';
import MobileChatSidebar from '../components/chat/MobileChatSidebar';

export default function MobileChat() {
  const {
    currentConversation,
    createConversation,
    addMessage,
    updateLastAssistantMessage,
    finalizeAssistantMessage,
    setCurrentConversation,
  } = useChat();

  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  const messages = currentConversation?.messages || [];

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    try {
      const convId = currentConversation?.id ?? await createConversation('private');
      await addMessage({ role: 'user', content: text }, convId);
      await addMessage({ role: 'assistant', content: '', isLoading: true }, convId);
      setIsStreaming(true);

      const history = currentConversation?.messages.map(m => ({ role: m.role, content: m.content })) || [];
      history.push({ role: 'user', content: text });

      let accumulated = '';
      try {
        await streamChat({
          messages: history,
          onDelta: (chunk) => {
            accumulated += chunk;
            updateLastAssistantMessage(accumulated, convId);
          },
          onDone: () => setIsStreaming(false),
          onSlowConnection: () => toast.info('模型正在思考中，请耐心等待...'),
        });
      } catch {
        setIsStreaming(false);
        if (!accumulated) updateLastAssistantMessage('抱歉，AI 回复出错了，请稍后再试。', convId);
      }
      await finalizeAssistantMessage(convId);
    } catch (err) {
      console.error('Send error:', err);
      toast.error('发送失败，请重试');
      setIsStreaming(false);
    }
  }, [isStreaming, currentConversation, createConversation, addMessage, updateLastAssistantMessage, finalizeAssistantMessage]);

  const handleNewChat = useCallback(() => {
    setCurrentConversation(null);
  }, [setCurrentConversation]);

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Sidebar */}
      <MobileChatSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3">
        <button onClick={() => setSidebarOpen(true)} className="text-white/50 hover:text-white/80 transition-colors">
          <Menu size={22} />
        </button>

        {/* Mode selector */}
        <div className="flex items-center bg-white/[0.06] rounded-full p-0.5">
          <button className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/[0.1] text-white">
            私人模式
          </button>
          <button className="px-4 py-1.5 rounded-full text-xs text-white/40">
            决策模式
          </button>
        </div>

        <button onClick={handleNewChat} className="text-amber-400/70 hover:text-amber-400 transition-colors">
          <Sparkles size={20} />
        </button>
      </header>

      {/* Content */}
      {messages.length === 0 ? (
        <MobileChatWelcome onSend={handleSend} />
      ) : (
        <MobileChatMessages messages={messages} />
      )}

      {/* Input */}
      <MobileChatInput
        onSend={handleSend}
        onVoiceClick={() => setVoiceOpen(true)}
        disabled={isStreaming}
      />

      {/* Voice panel */}
      {voiceOpen && (
        <MobileVoicePanel
          onClose={() => setVoiceOpen(false)}
          onSend={handleSend}
        />
      )}
    </div>
  );
}
