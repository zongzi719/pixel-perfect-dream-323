import { useState } from 'react';
import { Calendar, Clock, Users, Edit2, Share2, Copy, Play, Pause, SkipBack, SkipForward, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Meeting } from '@/data/meetingData';
import { cn } from '@/lib/utils';

interface MeetingDetailProps {
  meeting: Meeting;
}

export function MeetingDetail({ meeting }: MeetingDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {/* Meeting header card */}
      <div className="bg-card rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">
            {meeting.date.replace('2026.', '').replace('.', '-')} 10:00 {meeting.title}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
              <Edit2 className="h-4 w-4" /> 编辑
            </Button>
            <Button variant="outline" size="sm" className="text-primary border-primary/30 gap-1.5">
              <Share2 className="h-4 w-4" /> 分享
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {meeting.date}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {meeting.duration}</span>
          <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {meeting.participants}人参与</span>
        </div>

        {/* Audio player */}
        <div className="bg-secondary/50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-muted-foreground">00:00</span>
            <div className="flex-1 relative h-1 bg-border rounded-full">
              <div className="absolute left-0 top-0 h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-sm cursor-pointer"
                style={{ left: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{meeting.audioDuration || '00:00'}</span>
          </div>
          <div className="flex items-center justify-center gap-6">
            <button className="text-muted-foreground hover:text-foreground"><SlidersHorizontal className="h-5 w-5" /></button>
            <button className="text-muted-foreground hover:text-foreground"><SkipBack className="h-5 w-5" /></button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </button>
            <button className="text-muted-foreground hover:text-foreground"><SkipForward className="h-5 w-5" /></button>
            <span className="text-sm text-muted-foreground">1.0x</span>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-card rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">AI</span>
            <h3 className="font-semibold text-foreground">AI摘要</h3>
          </div>
          <button className="text-muted-foreground hover:text-foreground"><Copy className="h-4 w-4" /></button>
        </div>

        <div className="space-y-5">
          <section>
            <h4 className="font-medium text-foreground mb-2">要点</h4>
            <ul className="space-y-1.5">
              {meeting.aiSummary.keyPoints.map((p, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/40 flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h4 className="font-medium text-foreground mb-2">决策</h4>
            <ul className="space-y-1.5">
              {meeting.aiSummary.decisions.map((d, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/40 flex-shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
          </section>

          {meeting.aiSummary.openQuestions.length > 0 && (
            <section>
              <h4 className="font-medium text-foreground mb-2">开放性问题</h4>
              <ul className="space-y-1.5">
                {meeting.aiSummary.openQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/40 flex-shrink-0" />
                    {q}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {/* Todo items */}
      {meeting.aiSummary.todoItems.length > 0 && (
        <div className="bg-card rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">待办事项</h3>
            <button className="text-muted-foreground hover:text-foreground"><Copy className="h-4 w-4" /></button>
          </div>
          <ul className="space-y-3">
            {meeting.aiSummary.todoItems.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-border flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
