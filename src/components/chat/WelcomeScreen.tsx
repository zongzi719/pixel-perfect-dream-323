import { useChat } from '@/contexts/ChatContext';
import { useMode } from '@/contexts/ModeContext';

const suggestions = ['决策', '分析', '规划', '复盘'];

export function WelcomeScreen() {
  const { createConversation } = useChat();
  const { mode } = useMode();

  const handleStart = () => {
    createConversation(mode);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
        <span className="text-3xl">🤖</span>
      </div>

      <h1 className="text-2xl font-semibold text-foreground mb-2">Hi, MOUMOU~</h1>
      <p className="text-muted-foreground text-sm mb-8">有什么可以帮助你的吗？</p>

      {/* Suggestion tags */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {suggestions.map(tag => (
          <button
            key={tag}
            onClick={handleStart}
            className="px-4 py-2 rounded-full border border-border bg-card text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
