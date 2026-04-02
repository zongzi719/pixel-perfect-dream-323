import { useState } from 'react';
import { FileText, Clock, Folder, Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { KnowledgeFolder } from '@/data/knowledgeFiles';

interface KnowledgeSidebarProps {
  folders: KnowledgeFolder[];
  selectedFolder: string;
  onSelectFolder: (id: string) => void;
  onAddFolder: (name: string) => void;
  onRenameFolder: (id: string, name: string) => void;
}

export function KnowledgeSidebar({ folders, selectedFolder, onSelectFolder, onAddFolder, onRenameFolder }: KnowledgeSidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const navItems = folders.filter(f => f.id === 'all' || f.id === 'recent');
  const folderItems = folders.filter(f => f.id !== 'all' && f.id !== 'recent');

  const handleCreate = () => {
    if (newFolderName.trim()) {
      onAddFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      onRenameFolder(id, editName.trim());
      setEditingId(null);
    }
  };

  const startEdit = (folder: KnowledgeFolder) => {
    setEditingId(folder.id);
    setEditName(folder.name);
  };

  return (
    <div className="w-[200px] flex-shrink-0 flex flex-col h-full py-4 pr-2">
      {/* Nav items */}
      <div className="space-y-0.5 mb-4">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onSelectFolder(item.id)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors',
              selectedFolder === item.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            )}
          >
            {item.id === 'all' ? <FileText className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            <span className="flex-1 text-left">{item.name}</span>
            <span className="text-xs text-muted-foreground/60">{item.count}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-border my-2" />

      {/* Folders */}
      <div className="flex items-center justify-between px-3 mb-2">
        <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">文件夹</span>
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setIsCreating(true)}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="space-y-0.5 flex-1 overflow-y-auto">
        {folderItems.map(folder => (
          <div key={folder.id}>
            {editingId === folder.id ? (
              <div className="flex items-center gap-1 px-2">
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRename(folder.id)}
                  className="h-7 text-xs border-primary bg-primary/5"
                  autoFocus
                />
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleRename(folder.id)}>
                  <Check className="h-3 w-3 text-primary" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setEditingId(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => onSelectFolder(folder.id)}
                onDoubleClick={() => startEdit(folder)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors',
                  selectedFolder === folder.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                )}
              >
                <Folder className="h-4 w-4" />
                <span className="flex-1 text-left truncate">{folder.name}</span>
                <span className="text-xs text-muted-foreground/60">{folder.count}</span>
              </button>
            )}
          </div>
        ))}

        {/* New folder inline input */}
        {isCreating && (
          <div className="flex items-center gap-1 px-2">
            <Input
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="文件夹名称"
              className="h-7 text-xs border-primary bg-primary/5"
              autoFocus
            />
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCreate}>
              <Check className="h-3 w-3 text-primary" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => { setIsCreating(false); setNewFolderName(''); }}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
