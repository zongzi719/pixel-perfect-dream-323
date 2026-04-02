import { useState, useEffect } from 'react';
import { Check, Sparkles, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NoteCreateModalProps {
  content: string;
  onClose: () => void;
  onSave: (data: { title: string; tags: string[]; aiInsight: string; content: string }) => void;
}

type Phase = 'processing' | 'done';

export function NoteCreateModal({ content, onClose, onSave }: NoteCreateModalProps) {
  const [phase, setPhase] = useState<Phase>('processing');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [aiInsight, setAiInsight] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('done');
      setTitle('无感设计');
      setTags(['#想法', '#产品', '#AI', '#判断']);
      setAiInsight('流畅的体验可以降低认知负荷。目标是让技术感觉自然。');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Input area at top */}
        <div className="p-5 border-b border-border">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground flex-1">{content}</p>
          </div>
        </div>

        {/* Processing / Result area */}
        <div className="p-6 min-h-[200px] flex flex-col">
          {phase === 'processing' ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="animate-spin">
                <svg className="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <p className="text-xs text-muted-foreground">你的想法会被AI自动处理，从中挖掘洞察和联系。</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center mb-2">
                  <Check className="h-6 w-6 text-background" />
                </div>
                <p className="text-xs text-muted-foreground">你的想法会被AI自动处理，从中挖掘洞察和联系。</p>
              </div>

              {/* Title */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-semibold text-foreground">标题</span>
                  <button className="text-muted-foreground hover:text-foreground">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="AI 标题"
                  className="border-0 border-b border-border rounded-none px-1 focus-visible:ring-0"
                />
              </div>

              {/* Tags */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-foreground">建议标签</span>
                  <button className="text-muted-foreground hover:text-foreground">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1.5 rounded-full border border-border text-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> AI
                  </span>
                </div>
                <button className="mt-2 text-xs text-primary border border-dashed border-primary/40 rounded-full px-3 py-1">
                  + 添加标签
                </button>
              </div>

              {/* AI Insight */}
              <div className="mb-4">
                <span className="text-sm font-semibold text-foreground">AI 洞察</span>
                <div className="mt-1.5 bg-secondary/50 rounded-lg p-3">
                  {aiInsight && <p className="text-xs text-muted-foreground mb-1">{aiInsight}</p>}
                  <button className="text-xs text-primary">[ + AI 扩展 ]</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom actions */}
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="text-sm text-primary hover:underline">加入知识库</button>
            <button className="text-sm text-primary hover:underline">深入对话</button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">取消</button>
            <Button
              onClick={() => onSave({ title, tags, aiInsight, content })}
              className="rounded-full px-6"
              disabled={phase === 'processing'}
            >
              保存笔记
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
