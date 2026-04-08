import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Pause, Play, RotateCcw, Check, X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSend: (text: string) => void;
}

export default function MobileVoicePanel({ onClose, onSend }: Props) {
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [status]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const startRecording = () => setStatus('recording');
  const pauseRecording = () => setStatus('paused');
  const resumeRecording = () => setStatus('recording');
  const resetRecording = () => { setStatus('idle'); setSeconds(0); };

  const confirmRecording = useCallback(() => {
    // Simulated STT — in production, send audio to a speech-to-text API
    onSend(`[语音消息 ${formatTime(seconds)}]`);
    onClose();
  }, [seconds, onSend, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      {/* Close */}
      <div className="flex justify-end p-4">
        <button onClick={onClose} className="text-white/40 hover:text-white/60">
          <X size={24} />
        </button>
      </div>

      {/* Center area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <p className="text-white/50 text-sm">
          {status === 'idle' ? '点击开始录音' : status === 'recording' ? '正在录音...' : '已暂停'}
        </p>
        <p className="text-white text-3xl font-mono tracking-wider">{formatTime(seconds)}</p>

        {/* Main button */}
        {status === 'idle' ? (
          <button
            onClick={startRecording}
            className="w-20 h-20 rounded-full border-2 border-amber-500 bg-amber-500/10 flex items-center justify-center text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all"
          >
            <Mic size={32} />
          </button>
        ) : (
          <div className="flex items-center gap-8">
            <button
              onClick={resetRecording}
              className="w-12 h-12 rounded-full bg-white/[0.08] flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
            >
              <RotateCcw size={20} />
            </button>

            <button
              onClick={status === 'recording' ? pauseRecording : resumeRecording}
              className="w-20 h-20 rounded-full border-2 border-amber-500 bg-amber-500/10 flex items-center justify-center text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all"
            >
              {status === 'recording' ? <Pause size={32} /> : <Play size={32} />}
            </button>

            <button
              onClick={confirmRecording}
              className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-black active:scale-95 transition-transform"
            >
              <Check size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
