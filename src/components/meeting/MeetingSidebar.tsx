import { useState } from 'react';
import { Clock, FolderOpen, Plus, Mail } from 'lucide-react';
import { meetingFolders, type MeetingFolder } from '@/data/meetingData';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface MeetingSidebarProps {
  selectedFolder: string;
  onSelectFolder: (id: string) => void;
}

export function MeetingSidebar({ selectedFolder, onSelectFolder }: MeetingSidebarProps) {
  const [folders, setFolders] = useState<MeetingFolder[]>(meetingFolders);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      setFolders(prev => [...prev, { id: `folder-${Date.now()}`, name: newFolderName.trim(), count: 0 }]);
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="w-[200px] flex-shrink-0 flex flex-col py-4 border-r border-border">
      {/* Nav */}
      <button
        onClick={() => onSelectFolder('all')}
        className={cn(
          'flex items-center gap-2.5 px-4 py-2 text-sm transition-colors',
          selectedFolder === 'all' ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Mail className="h-4 w-4" />
        全部会议
      </button>
      <button
        onClick={() => onSelectFolder('recent')}
        className={cn(
          'flex items-center gap-2.5 px-4 py-2 text-sm transition-colors',
          selectedFolder === 'recent' ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Clock className="h-4 w-4" />
        最近
      </button>

      {/* Folders */}
      <div className="mt-4 px-4">
        <p className="text-xs text-muted-foreground/60 mb-2">文件夹</p>
      </div>

      {isCreating ? (
        <div className="px-4 mb-1">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary flex-shrink-0" />
            <Input
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setIsCreating(false); }}
              onBlur={handleCreateFolder}
              autoFocus
              className="h-7 text-sm border-primary bg-primary/5 px-2"
              placeholder="文件夹名称"
            />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2.5 px-4 py-2 text-sm text-primary hover:bg-secondary/60 transition-colors"
        >
          <FolderOpen className="h-4 w-4" />
          新建文件夹
        </button>
      )}

      {folders.filter(f => f.id !== 'all').map(folder => (
        <button
          key={folder.id}
          onClick={() => onSelectFolder(folder.id)}
          className={cn(
            'flex items-center justify-between px-4 py-2 text-sm transition-colors',
            selectedFolder === folder.id ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span className="flex items-center gap-2.5">
            <FolderOpen className="h-4 w-4" />
            {folder.name}
          </span>
          <span className="text-xs text-muted-foreground/50">{folder.count}</span>
        </button>
      ))}
    </div>
  );
}
