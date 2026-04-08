import { RefreshCw } from 'lucide-react';
import { useState, useCallback } from 'react';

const allSuggestions = [
  '帮我生成一个笔记',
  '帮我写一篇市场分析',
  '帮我做一份年度规划',
  '测一下我的MBTI',
  '帮我复盘上次会议',
  '给我的产品提3个改进方向',
  '帮我分析竞争对手',
  '给团队写一封鼓励邮件',
  '帮我做一个SWOT分析',
  '帮我梳理OKR',
];

interface Props {
  onSend: (text: string) => void;
}

export default function MobileChatWelcome({ onSend }: Props) {
  const [page, setPage] = useState(0);
  const perPage = 4;
  const maxPage = Math.ceil(allSuggestions.length / perPage) - 1;

  const suggestions = allSuggestions.slice(page * perPage, page * perPage + perPage);

  const shuffle = useCallback(() => {
    setPage(p => p >= maxPage ? 0 : p + 1);
  }, [maxPage]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4">
      {/* AI YOU Title */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-white mb-1">
          我是<span className="text-amber-400">AI YOU</span>
        </h1>
        <p className="text-sm text-white/50">你的分身已经准备用你的方式思考</p>
      </div>

      {/* Suggestions */}
      <div className="w-full max-w-sm space-y-3">
        <p className="text-xs text-white/40 text-center">试试问我：</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onSend(s)}
              className="px-4 py-2 rounded-full bg-white/[0.08] border border-white/[0.1] text-sm text-white/80 hover:bg-white/[0.14] active:scale-95 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={shuffle}
          className="flex items-center gap-1 mx-auto text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          换一批 <RefreshCw size={12} />
        </button>
        <p className="text-xs text-white/30 text-center mt-4">
          或者随便聊点什么——我都能接得住
        </p>
      </div>
    </div>
  );
}
