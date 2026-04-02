import { Sparkles, MoreHorizontal } from 'lucide-react';
import { InspirationNote } from '@/data/notesData';

interface NoteCardProps {
  note: InspirationNote;
  isSelected?: boolean;
  onClick?: () => void;
}

export function NoteCard({ note, isSelected, onClick }: NoteCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-xl p-4 cursor-pointer transition-all hover:shadow-md border ${
        isSelected ? 'border-primary ring-1 ring-primary' : 'border-transparent'
      }`}
    >
      <h3 className="font-bold text-foreground mb-2">{note.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{note.content}</p>

      {note.aiInsight && (
        <div className="bg-secondary/50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">AI 洞察</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{note.aiInsight}</p>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap mb-2">
        {note.tags.map(tag => (
          <span
            key={tag}
            className="text-xs px-2.5 py-1 rounded-full border border-border text-foreground"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{note.createdAt}</span>
        {isSelected && (
          <button className="text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
