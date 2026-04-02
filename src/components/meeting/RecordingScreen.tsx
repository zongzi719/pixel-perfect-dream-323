import { useState, useEffect, useRef } from 'react';
import { Mic, Clock, Edit2, Pause, BookmarkPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TranscriptEntry } from '@/data/meetingData';
import { cn } from '@/lib/utils';

interface RecordingScreenProps {
  onEnd: () => void;
}

const mockTranscripts: TranscriptEntry[] = [
  { speaker: '发言人 1', timestamp: '00:01', text: '我们来讨论一下第二季度的增长战略。我认为我们需要重点关注数字营销举措。' },
  { speaker: '发言人 2', timestamp: '00:38', text: '我同意。我们目前的广告成本正在大幅上涨，我们需要优化转化率。' },
];

export function RecordingScreen({ onEnd }: RecordingScreenProps) {
  const [seconds, setSeconds] = useState(0);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [insightTags, setInsightTags] = useState<string[]>([]);
  const [insightText, setInsightText] = useState('随着讨论的深入，AI 分析将会逐渐显现......');
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Simulate transcripts appearing
  useEffect(() => {
    const t1 = setTimeout(() => {
      setTranscripts([mockTranscripts[0]]);
    }, 3000);
    const t2 = setTimeout(() => {
      setTranscripts(mockTranscripts);
      setInsightTags(['#增长', '#市场', '#价格']);
      setInsightText('讨论的重点是增长战略和不断上涨的获客成本，对于依赖付费渠道的看法不一。');
    }, 8000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const formatTime = (s: number) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const meetingTitle = `03-19 10:00 团队战略..`;

  return (
    <div className="flex-1 flex flex-col">
      {/* Recording top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <Mic className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">录音中...</span>
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        </div>

        <div className="flex items-center gap-2 text-sm text-primary">
          <Clock className="h-4 w-4" />
          {formatTime(seconds)}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground">{meetingTitle}</span>
          <button className="text-muted-foreground hover:text-foreground"><Edit2 className="h-4 w-4" /></button>
        </div>

        <Button
          onClick={onEnd}
          variant="destructive"
          size="sm"
          className="rounded-full px-4"
        >
          结束会议录制
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Real-time transcript */}
        <div className="bg-card rounded-xl p-6 shadow-sm min-h-[300px]">
          <h3 className="font-semibold text-foreground mb-4 pb-3 border-b border-border">实时转写</h3>
          {transcripts.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center mt-20">聆听中...</p>
          ) : (
            <div className="space-y-5">
              {transcripts.map((t, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-primary">{t.speaker}</span>
                    <span className="text-xs text-muted-foreground">{t.timestamp}</span>
                  </div>
                  <p className="text-sm text-foreground">{t.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="bg-card rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-3">AI 实时洞察</h3>
          {insightTags.length > 0 && (
            <div className="flex gap-2 mb-3">
              {insightTags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-secondary text-sm text-foreground">{tag}</span>
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground">{insightText}</p>
          <p className="text-xs text-muted-foreground/50 mt-4">AI 总结会随会议进行进行更新</p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-center gap-4 py-4 border-t border-border">
        <Button variant="outline" className="gap-2 rounded-full px-6">
          <Pause className="h-4 w-4" /> 暂停
        </Button>
        <Button className="gap-2 rounded-full px-6 bg-foreground text-background hover:bg-foreground/90">
          <BookmarkPlus className="h-4 w-4" /> 添加标记
        </Button>
      </div>
    </div>
  );
}
