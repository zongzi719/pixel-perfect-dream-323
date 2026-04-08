import { useState, useCallback } from 'react';
import { Menu, Sparkles, Users } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useMode } from '@/contexts/ModeContext';
import { streamChat } from '@/lib/streamChat';
import { coaches } from '@/data/coaches';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import MobileChatWelcome from '../components/chat/MobileChatWelcome';
import MobileChatMessages from '../components/chat/MobileChatMessages';
import MobileChatInput from '../components/chat/MobileChatInput';
import MobileVoicePanel from '../components/chat/MobileVoicePanel';
import MobileChatSidebar from '../components/chat/MobileChatSidebar';
import MobileDecisionWelcome from '../components/chat/MobileDecisionWelcome';
import MobileDecisionMessages from '../components/chat/MobileDecisionMessages';
import MobileCoachSelector from '../components/chat/MobileCoachSelector';
import MobileAttachmentPicker from '../components/chat/MobileAttachmentPicker';

export default function MobileChat() {
  const {
    currentConversation,
    createConversation,
    addMessage,
    updateLastAssistantMessage,
    finalizeAssistantMessage,
    setCurrentConversation,
    decisionStarted,
    setDecisionStarted,
  } = useChat();

  const { mode, setMode, selectedCoaches, disabledCoaches } = useMode();

  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [coachSelectorOpen, setCoachSelectorOpen] = useState(false);
  const [attachmentOpen, setAttachmentOpen] = useState(false);

  const messages = currentConversation?.messages || [];

  // Private mode send
  const handlePrivateSend = useCallback(async (text: string) => {
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
          onDelta: (chunk) => { accumulated += chunk; updateLastAssistantMessage(accumulated, convId); },
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

  // Decision mode send — calls each coach sequentially
  const handleDecisionSend = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    try {
      const convId = currentConversation?.id ?? await createConversation('decision', selectedCoaches);
      await addMessage({ role: 'user', content: text }, convId);
      setIsStreaming(true);

      const activeCoaches = selectedCoaches.filter(id => !disabledCoaches.includes(id));
      const coachData = activeCoaches.map(id => coaches.find(c => c.id === id)).filter(Boolean);

      const userHistory = currentConversation?.messages
        .filter(m => m.role === 'user')
        .map(m => ({ role: m.role, content: m.content })) || [];
      userHistory.push({ role: 'user', content: text });

      for (const coach of coachData) {
        if (!coach) continue;
        // Add loading placeholder
        await addMessage({ role: 'assistant', content: '', coachId: coach.id, isLoading: true }, convId);

        const systemPrompt = `你是${coach.name}（${coach.role}），${coach.description}。请从你的专业角度分析用户的问题。请用以下结构化格式回答：\n\n## 决策建议\n（你的建议）\n\n## 关键问题\n（需要考虑的问题）\n\n## 风险提示\n（潜在风险）`;

        const messages = [
          { role: 'system', content: systemPrompt },
          ...userHistory,
        ];

        let accumulated = '';
        try {
          await streamChat({
            messages,
            onDelta: (chunk) => { accumulated += chunk; updateLastAssistantMessage(accumulated, convId); },
            onDone: () => {},
            onSlowConnection: () => toast.info(`${coach.name} 正在思考中...`),
          });
        } catch {
          if (!accumulated) updateLastAssistantMessage(`抱歉，${coach.name} 回复出错了。`, convId);
        }
        await finalizeAssistantMessage(convId);
      }

      setIsStreaming(false);
    } catch (err) {
      console.error('Decision send error:', err);
      toast.error('发送失败，请重试');
      setIsStreaming(false);
    }
  }, [isStreaming, currentConversation, createConversation, addMessage, updateLastAssistantMessage, finalizeAssistantMessage, selectedCoaches, disabledCoaches]);

  const handleSend = mode === 'decision' ? handleDecisionSend : handlePrivateSend;

  const handleNewChat = useCallback(() => {
    setCurrentConversation(null);
    if (mode === 'decision') setDecisionStarted(false);
  }, [setCurrentConversation, setDecisionStarted, mode]);

  const handleDecisionStart = useCallback(() => {
    setDecisionStarted(true);
  }, [setDecisionStarted]);

  const isDecision = mode === 'decision';
  const showDecisionWelcome = isDecision && !decisionStarted && messages.length === 0;
  const showPrivateWelcome = !isDecision && messages.length === 0;

  return (
    <div className="flex flex-col h-full bg-black">
      <MobileChatSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-4 py-3">
        <button onClick={() => setSidebarOpen(true)} className="text-white/50 hover:text-white/80 transition-colors">
          <Menu size={22} />
        </button>

        {/* Mode switcher */}
        <div className="flex items-center bg-white/[0.06] rounded-full p-0.5">
          <button
            onClick={() => { setMode('private'); setDecisionStarted(false); }}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium transition-all',
              !isDecision ? 'bg-white/[0.1] text-white' : 'text-white/40'
            )}
          >
            私人模式
          </button>
          <button
            onClick={() => setMode('decision')}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium transition-all',
              isDecision ? 'bg-white/[0.1] text-white' : 'text-white/40'
            )}
          >
            决策模式
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isDecision && (
            <button onClick={() => setCoachSelectorOpen(true)} className="text-amber-400/70 hover:text-amber-400 transition-colors">
              <Users size={20} />
            </button>
          )}
          <button onClick={handleNewChat} className="text-amber-400/70 hover:text-amber-400 transition-colors">
            <Sparkles size={20} />
          </button>
        </div>
      </header>

      {/* Content */}
      {showDecisionWelcome ? (
        <MobileDecisionWelcome onStart={handleDecisionStart} />
      ) : showPrivateWelcome ? (
        <MobileChatWelcome onSend={handleSend} />
      ) : isDecision ? (
        <MobileDecisionMessages messages={messages} />
      ) : (
        <MobileChatMessages messages={messages} />
      )}

      {/* Input */}
      <MobileChatInput
        onSend={handleSend}
        onVoiceClick={() => setVoiceOpen(true)}
        onAttachmentClick={() => setAttachmentOpen(true)}
        disabled={isStreaming}
      />

      {/* Overlays */}
      {voiceOpen && <MobileVoicePanel onClose={() => setVoiceOpen(false)} onSend={handleSend} />}
      <MobileCoachSelector isOpen={coachSelectorOpen} onClose={() => setCoachSelectorOpen(false)} />
      <MobileAttachmentPicker isOpen={attachmentOpen} onClose={() => setAttachmentOpen(false)} />
    </div>
  );
}
