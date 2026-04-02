import { FileText, Presentation, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { KnowledgeFile } from '@/data/knowledgeFiles';

interface FileListProps {
  files: KnowledgeFile[];
}

const typeConfig: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  pdf: { icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
  doc: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
  ppt: { icon: Presentation, color: 'text-orange-500', bg: 'bg-orange-50' },
  image: { icon: FileText, color: 'text-green-500', bg: 'bg-green-50' },
  video: { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50' },
  audio: { icon: FileText, color: 'text-cyan-500', bg: 'bg-cyan-50' },
};

const statusColors: Record<string, string> = {
  summary_ready: 'text-emerald-600 bg-emerald-50',
  draft_completed: 'text-blue-600 bg-blue-50',
  under_review: 'text-amber-600 bg-amber-50',
};

export function FileList({ files }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">暂无文件</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">最近7天</h3>
          <span className="text-xs text-muted-foreground">{files.length} 个文件</span>
        </div>
        <button className="text-xs text-primary hover:underline">管理</button>
      </div>

      <div className="space-y-2">
        {files.map(file => {
          const config = typeConfig[file.type] || typeConfig.pdf;
          const Icon = config.icon;
          return (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50 hover:border-border hover:shadow-sm transition-all group"
            >
              {/* File icon */}
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', config.bg)}>
                <Icon className={cn('h-5 w-5', config.color)} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={cn('inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full font-medium', statusColors[file.status])}>
                    <CheckCircle2 className="h-3 w-3" />
                    {file.statusLabel}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{file.date}</span>
                </div>
              </div>

              {/* Ask AI button */}
              <Button
                variant="outline"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 rounded-full text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                问问 AI
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
