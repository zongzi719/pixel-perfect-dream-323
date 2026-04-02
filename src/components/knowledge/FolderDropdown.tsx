import { ChevronDown, Folder, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { KnowledgeFolder } from '@/data/knowledgeFiles';
import { useState } from 'react';

interface FolderDropdownProps {
  folders: KnowledgeFolder[];
  selectedFolder: string;
  onSelect: (id: string) => void;
}

export function FolderDropdown({ folders, selectedFolder, onSelect }: FolderDropdownProps) {
  const [open, setOpen] = useState(false);
  const current = folders.find(f => f.id === selectedFolder) || folders[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <span className="text-muted-foreground/70">上传到:</span>
          <span className="font-medium text-foreground">{current.name}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1.5" align="start">
        {folders.filter(f => f.id !== 'recent').map(folder => (
          <button
            key={folder.id}
            onClick={() => { onSelect(folder.id); setOpen(false); }}
            className={cn(
              'w-full flex items-center gap-2 px-2.5 py-1.5 text-sm rounded-md transition-colors',
              selectedFolder === folder.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground hover:bg-secondary'
            )}
          >
            <Folder className="h-3.5 w-3.5" />
            <span>{folder.name}</span>
          </button>
        ))}
        <div className="border-t border-border my-1" />
        <button className="w-full flex items-center gap-2 px-2.5 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-md transition-colors">
          <Plus className="h-3.5 w-3.5" />
          <span>新建文件夹</span>
        </button>
      </PopoverContent>
    </Popover>
  );
}
