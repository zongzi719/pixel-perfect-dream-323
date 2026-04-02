import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NewMeetingScreenProps {
  onStart: () => void;
}

export function NewMeetingScreen({ onStart }: NewMeetingScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      {/* Mic with glow */}
      <div className="relative mb-8">
        <div className="absolute inset-0 w-32 h-32 -m-8 rounded-full bg-primary/20 blur-2xl" />
        <div className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
          <Mic className="h-8 w-8 text-primary-foreground" />
        </div>
      </div>

      <Button
        onClick={onStart}
        className="px-12 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-base shadow-lg shadow-primary/30 hover:bg-primary/90"
      >
        开始会议
      </Button>
      <p className="mt-3 text-sm text-muted-foreground">点击开始录音和转录</p>
    </div>
  );
}
