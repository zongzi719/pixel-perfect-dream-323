import { useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { ChatMessage } from './ChatMessage';

export function ChatArea() {
  const { currentConversation } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages.length]);

  if (!currentConversation) return null;

  return (
    <div className="flex-1 overflow-y-auto px-4">
      <div className="max-w-2xl mx-auto py-6">
        {currentConversation.messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
