import { X, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileChatSidebar({ isOpen, onClose }: Props) {
  const { conversations, currentConversation, setCurrentConversation, deleteConversation, loadingConversations } = useChat();
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const filtered = search
    ? conversations.filter(c => c.title.includes(search))
    : conversations;

  // Group by date
  const grouped: Record<string, typeof conversations> = {};
  filtered.forEach(c => {
    const key = c.updatedAt.toLocaleDateString('zh-CN');
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(c);
  });

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-[280px] bg-neutral-950 border-r border-white/[0.06] z-50 flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 flex items-center gap-3 border-b border-white/[0.06]">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold">
            {user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.email?.split('@')[0] || '用户'}</p>
            <p className="text-[10px] text-amber-400/70">Lv.3 对齐率 65%</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/50">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 bg-white/[0.06] rounded-lg px-3 py-2">
            <Search size={14} className="text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索对话"
              className="flex-1 bg-transparent text-xs text-white placeholder:text-white/25 focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-3">
          {loadingConversations ? (
            <p className="text-white/20 text-xs text-center py-4">加载中...</p>
          ) : Object.keys(grouped).length === 0 ? (
            <p className="text-white/20 text-xs text-center py-4">暂无对话</p>
          ) : (
            Object.entries(grouped).map(([date, convs]) => (
              <div key={date}>
                <p className="text-[10px] text-white/25 px-2 mb-1">{date}</p>
                {convs.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setCurrentConversation(c.id); onClose(); }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg text-sm truncate flex items-center justify-between group transition-colors",
                      c.id === currentConversation?.id
                        ? 'bg-white/[0.08] text-white'
                        : 'text-white/50 hover:bg-white/[0.04]'
                    )}
                  >
                    <span className="truncate">{c.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                      className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all shrink-0 ml-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
