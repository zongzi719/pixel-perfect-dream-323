import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Message, Conversation, AppMode } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  createConversation: (mode: AppMode, coaches?: string[]) => Promise<string>;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>, targetConvId?: string) => Promise<string>;
  updateLastAssistantMessage: (content: string, targetConvId?: string) => void;
  finalizeAssistantMessage: (targetConvId?: string) => Promise<void>;
  setCurrentConversation: (id: string | null) => void;
  deleteConversation: (id: string) => Promise<void>;
  decisionStarted: boolean;
  setDecisionStarted: (v: boolean) => void;
  loadingConversations: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [decisionStarted, setDecisionStarted] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  // Track the last assistant message id per conversation for DB updates
  const lastAssistantMsgId = useRef<Record<string, string>>({});

  const currentConversation = conversations.find(c => c.id === currentId) || null;

  // Load conversations on user change
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setCurrentId(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadingConversations(true);
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (cancelled) return;
      const convs: Conversation[] = (data || []).map(row => ({
        id: row.id,
        title: row.last_message?.slice(0, 20) || '新对话',
        mode: 'private' as AppMode,
        messages: [],
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
      }));
      setConversations(convs);
      setLoadingConversations(false);
    };
    load();
    return () => { cancelled = true; };
  }, [user]);

  // Load messages when switching conversation
  useEffect(() => {
    if (!currentId) return;
    const conv = conversations.find(c => c.id === currentId);
    if (!conv || conv.messages.length > 0) return; // already loaded

    const load = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentId)
        .order('created_at', { ascending: true });
      if (!data) return;
      const msgs: Message[] = data.map(row => ({
        id: row.id,
        role: row.role as 'user' | 'assistant',
        content: row.content,
        coachId: row.coach_id || undefined,
        timestamp: new Date(row.created_at),
      }));
      setConversations(prev =>
        prev.map(c => c.id === currentId ? { ...c, messages: msgs } : c)
      );
    };
    load();
  }, [currentId]);

  const createConversation = useCallback(async (mode: AppMode, coaches?: string[]): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, status: 'normal' })
      .select('id')
      .single();
    if (error || !data) throw error || new Error('Failed to create conversation');
    const conv: Conversation = {
      id: data.id,
      title: mode === 'private' ? '新对话' : '决策会议',
      mode,
      messages: [],
      selectedCoaches: coaches,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations(prev => [conv, ...prev]);
    setCurrentId(data.id);
    return data.id;
  }, [user]);

  const addMessage = useCallback(async (msg: Omit<Message, 'id' | 'timestamp'>, targetConvId?: string): Promise<string> => {
    const cid = targetConvId || currentId;
    if (!cid) throw new Error('No conversation');

    // Insert into DB
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: cid,
        role: msg.role,
        content: msg.content || '',
        coach_id: msg.coachId || null,
      })
      .select('id')
      .single();
    if (error || !data) throw error || new Error('Failed to insert message');

    const message: Message = {
      ...msg,
      id: data.id,
      timestamp: new Date(),
    };

    // Track assistant message for later update
    if (msg.role === 'assistant') {
      lastAssistantMsgId.current[cid] = data.id;
    }

    // Update local state
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== cid) return c;
        const newTitle = c.messages.length === 0 && msg.role === 'user' ? msg.content.slice(0, 20) : c.title;
        return {
          ...c,
          messages: [...c.messages, message],
          title: newTitle,
          updatedAt: new Date(),
        };
      })
    );

    // Update conversation metadata for user messages
    if (msg.role === 'user') {
      supabase
        .from('conversations')
        .update({
          last_message: msg.content.slice(0, 100),
          message_count: (conversations.find(c => c.id === cid)?.messages.length || 0) + 1,
        })
        .eq('id', cid)
        .then();
    }

    return data.id;
  }, [currentId, conversations]);

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

  const finalizeAssistantMessage = useCallback(async (targetConvId?: string) => {
    const cid = targetConvId || currentId;
    if (!cid) return;
    const msgId = lastAssistantMsgId.current[cid];
    if (!msgId) return;

    const conv = conversations.find(c => c.id === cid);
    if (!conv) return;
    const lastMsg = conv.messages[conv.messages.length - 1];
    if (!lastMsg || lastMsg.role !== 'assistant') return;

    // Update message content in DB
    await supabase
      .from('messages')
      .update({ content: lastMsg.content })
      .eq('id', msgId);

    // Update conversation metadata
    await supabase
      .from('conversations')
      .update({
        last_message: lastMsg.content.slice(0, 100),
        message_count: conv.messages.length,
      })
      .eq('id', cid);

    delete lastAssistantMsgId.current[cid];
  }, [currentId, conversations]);

  const setCurrentConversation = useCallback((id: string | null) => {
    setCurrentId(id);
  }, []);

  return (
    <ChatContext.Provider value={{
      conversations, currentConversation, createConversation, addMessage,
      updateLastAssistantMessage, finalizeAssistantMessage, setCurrentConversation,
      decisionStarted, setDecisionStarted, loadingConversations,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
