import { useState } from 'react';
import { Mic, Camera, Paperclip, ArrowUp } from 'lucide-react';

interface Props {
  onSend: (text: string) => void;
  onVoiceClick: () => void;
  onAttachmentClick?: () => void;
  disabled?: boolean;
}

export default function MobileChatInput({ onSend, onVoiceClick, onAttachmentClick, disabled }: Props) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  const hasText = input.trim().length > 0;

  return (
    <div className="shrink-0 px-3 pb-2 pt-1">
      <div className="flex items-center gap-2 bg-white/[0.07] border border-white/[0.1] rounded-2xl px-3 py-2">
        <button className="text-white/30 hover:text-white/50 transition-colors shrink-0">
          <Paperclip size={20} />
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="问一问AI YOU"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none min-w-0"
          disabled={disabled}
        />

        {hasText ? (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="shrink-0 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-40"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={onVoiceClick} className="text-white/30 hover:text-white/50 transition-colors">
              <Mic size={20} />
            </button>
            <button className="text-white/30 hover:text-white/50 transition-colors">
              <Camera size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
