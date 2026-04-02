import React, { createContext, useContext, useState, useCallback } from 'react';
import { Message, Conversation, AppMode } from '@/types';

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  createConversation: (mode: AppMode, coaches?: string[]) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
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

  const createConversation = useCallback((mode: AppMode, coaches?: string[]) => {
    const conv: Conversation = {
      id: `conv-${Date.now()}`,
      title: mode === 'private' ? '新对话' : '决策会议',
      mode,
      messages: [],
      selectedCoaches: coaches,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations(prev => [conv, ...prev]);
    setCurrentId(conv.id);
  }, []);

  const addMessage = useCallback((msg: Omit<Message, 'id' | 'timestamp'>) => {
    const message: Message = { ...msg, id: genId(), timestamp: new Date() };
    setConversations(prev =>
      prev.map(c =>
        c.id === currentId
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

  const setCurrentConversation = useCallback((id: string | null) => {
    setCurrentId(id);
  }, []);

  return (
    <ChatContext.Provider value={{ conversations, currentConversation, createConversation, addMessage, setCurrentConversation, decisionStarted, setDecisionStarted }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
