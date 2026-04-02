import { useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const fileTypes = [
  { label: 'PDF', color: 'bg-red-100 text-red-600' },
  { label: 'DOC', color: 'bg-blue-100 text-blue-600' },
  { label: 'PPT', color: 'bg-orange-100 text-orange-600' },
  { label: '图片', color: 'bg-green-100 text-green-600' },
  { label: '视频', color: 'bg-purple-100 text-purple-600' },
  { label: '音频', color: 'bg-cyan-100 text-cyan-600' },
];

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={e => { e.preventDefault(); setIsDragging(false); }}
      className={cn(
        'border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/40 hover:bg-primary/[0.02]'
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Upload className="h-6 w-6 text-primary" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">把文件拖到这里或点击上传</p>
      <p className="text-xs text-muted-foreground mb-4">上传您的第一份文档，即可开始使用人工智能驱动的知识管理。</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {fileTypes.map(ft => (
          <span key={ft.label} className={cn('px-2.5 py-1 rounded-full text-[11px] font-medium', ft.color)}>
            {ft.label}
          </span>
        ))}
      </div>
    </div>
  );
}
