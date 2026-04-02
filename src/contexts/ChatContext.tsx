import React, { createContext, useContext, useState, useCallback } from 'react';
import { Message, Conversation, AppMode } from '@/types';

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  createConversation: (mode: AppMode, coaches?: string[]) => string;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>, targetConvId?: string) => void;
  updateLastAssistantMessage: (content: string, targetConvId?: string) => void;
  setCurrentConversation: (id: string | null) => void;
  decisionStarted: boolean;
  setDecisionStarted: (v: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

let nextId = 1;
const genId = () => `msg-${nextId++}`;

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [decisionStarted, setDecisionStarted] = useState(false);

  const currentConversation = conversations.find(c => c.id === currentId) || null;

  const createConversation = useCallback((mode: AppMode, coaches?: string[]): string => {
    const convId = `conv-${Date.now()}`;
    const conv: Conversation = {
      id: convId,
      title: mode === 'private' ? '新对话' : '决策会议',
      mode,
      messages: [],
      selectedCoaches: coaches,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations(prev => [conv, ...prev]);
    setCurrentId(convId);
    return convId;
  }, []);

  const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp'>, targetConvId?: string) => {
    const message: Message = { ...msg, id: genId(), timestamp: new Date() };
    const cid = targetConvId || currentId;
    setConversations(prev =>
      prev.map(c =>
        c.id === cid
          ? {
              ...c,
              messages: [...c.messages, message],
              title: c.messages.length === 0 && msg.role === 'user' ? msg.content.slice(0, 20) : c.title,
              updatedAt: new Date(),
            }
          : c
      )
    );
  }, [currentId]);

  const updateLastAssistantMessage = useCallback((content: string, targetConvId?: string) => {
    const cid = targetConvId || currentId;
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== cid) return c;
        const msgs = [...c.messages];
        const lastIdx = msgs.length - 1;
        if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant') {
          msgs[lastIdx] = { ...msgs[lastIdx], content, isLoading: false };
        }
        return { ...c, messages: msgs, updatedAt: new Date() };
      })
    );
  }, [currentId]);

  const setCurrentConversation = useCallback((id: string | null) => {
    setCurrentId(id);
  }, []);

  return (
    <ChatContext.Provider value={{ conversations, currentConversation, createConversation, addMessage, updateLastAssistantMessage, setCurrentConversation, decisionStarted, setDecisionStarted }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
