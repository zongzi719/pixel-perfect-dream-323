import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, BookOpen, FileText, Lightbulb, Settings, ChevronLeft, MessageSquare, Trash2, LogOut, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';
import { useMode } from '@/contexts/ModeContext';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format, isToday, isYesterday } from 'date-fns';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: Plus, label: '新聊天', action: 'new' },
  { icon: BookOpen, label: '知识库', action: 'knowledge', route: '/knowledge' },
  { icon: FileText, label: '会议纪要', action: 'minutes', route: '/meetings' },
  { icon: Lightbulb, label: '灵感笔记', action: 'notes', route: '/notes' },
];

function formatTime(date: Date) {
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return '昨天';
  return format(date, 'MM/dd');
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [search, setSearch] = useState('');
  const { conversations, currentConversation, setCurrentConversation, createConversation, deleteConversation } = useChat();
  const { mode } = useMode();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleNewChat = () => {
    createConversation(mode).catch(() => {});
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteConversation(deleteTarget);
      setDeleteTarget(null);
    }
  };

  const grouped = groupByDate(conversations);

  if (collapsed) {
    return (
      <div className="w-14 h-full flex flex-col items-center py-4 gap-2 border-r border-border bg-card/50">
        <Button variant="ghost" size="icon" onClick={onToggle} className="mb-4">
          <MessageSquare className="h-5 w-5" />
        </Button>
        {navItems.map(item => (
          <Button
            key={item.action}
            variant="ghost"
            size="icon"
            onClick={item.action === 'new' ? handleNewChat : (item as any).route ? () => navigate((item as any).route) : undefined}
          >
            <item.icon className="h-4 w-4" />
          </Button>
        ))}
        <div className="flex-1" />
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="w-[220px] h-full flex flex-col border-r border-border bg-card/50">
        {/* Header */}
        <div className="p-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">AIYOU</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索"
              className="h-8 pl-8 text-xs bg-secondary/50 border-0"
            />
          </div>
        </div>

        {/* Nav items */}
        <div className="px-2 space-y-0.5">
          {navItems.map(item => (
            <button
              key={item.action}
              onClick={item.action === 'new' ? handleNewChat : (item as any).route ? () => navigate((item as any).route) : undefined}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg transition-colors"
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto mt-4 px-2">
          {Object.entries(grouped).map(([label, convs]) => (
            <div key={label} className="mb-3">
              <p className="px-2.5 text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider mb-1">{label}</p>
              {convs.map(conv => (
                <div
                  key={conv.id}
                  className={cn(
                    'group flex items-center gap-1 px-2.5 py-1.5 rounded-md transition-colors cursor-pointer',
                    currentConversation?.id === conv.id
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/40'
                  )}
                  onClick={() => setCurrentConversation(conv.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs truncate', currentConversation?.id === conv.id && 'font-medium')}>
                      {conv.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50">{formatTime(conv.updatedAt)}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteTarget(conv.id); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="p-3 border-t border-border">
          <button className="w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors">
            <Settings className="h-4 w-4" />
            <span>设置</span>
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>删除后对话记录将无法恢复，确定要删除吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function groupByDate(conversations: { id: string; title: string; createdAt: Date; updatedAt: Date }[]) {
  const groups: Record<string, typeof conversations> = {};
  const now = new Date();
  for (const conv of conversations) {
    const diff = now.getTime() - conv.updatedAt.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    let label = '更早';
    if (days === 0) label = '今天';
    else if (days === 1) label = '昨天';
    else if (days <= 7) label = '最近7天';
    else if (days <= 30) label = '最近30天';
    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
  }
  return groups;
}
