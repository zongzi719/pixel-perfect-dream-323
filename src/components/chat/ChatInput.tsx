import { useState } from 'react';
import { Send, Plus, Mic, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/contexts/ChatContext';
import { useMode } from '@/contexts/ModeContext';
import { coaches } from '@/data/coaches';

const mockResponses: Record<string, { content: string; tags?: string[] }> = {
  strategy: {
    content: '从战略角度分析，这个方向具有较大的市场潜力。建议先进行小规模验证，确认产品-市场契合度后再大规模投入。关键是要建立明确的竞争壁垒，避免陷入同质化竞争。',
    tags: ['决策建议', '关键问题'],
  },
  risk: {
    content: '⚠️ 需要关注以下风险点：\n1. 市场进入时机风险 - 当前市场环境存在不确定性\n2. 资金链风险 - 需确保有足够的现金流储备\n3. 团队能力匹配风险 - 评估现有团队是否具备执行能力',
    tags: ['风险提示', '关键问题'],
  },
  product: {
    content: '从产品视角来看，用户需求验证是第一优先级。建议采用MVP方式快速验证核心假设，通过用户访谈和数据分析迭代优化产品方案。',
    tags: ['决策建议', '不同视角'],
  },
};

export function ChatInput() {
  const [input, setInput] = useState('');
  const { addMessage, createConversation, currentConversation } = useChat();
  const { mode, selectedCoaches } = useMode();

  const handleSend = () => {
    if (!input.trim()) return;

    if (!currentConversation) {
      createConversation(mode, mode === 'decision' ? selectedCoaches : undefined);
    }

    // Add user message
    addMessage({ role: 'user', content: input.trim() });
    const userInput = input.trim();
    setInput('');

    // Simulate response
    if (mode === 'decision') {
      selectedCoaches.forEach((coachId, i) => {
        setTimeout(() => {
          const mock = mockResponses[coachId] || {
            content: `作为${coaches.find(c => c.id === coachId)?.role}，我认为这是一个值得深入探讨的问题。让我从我的专业角度为你分析...`,
            tags: ['决策建议'],
          };
          addMessage({
            role: 'assistant',
            content: mock.content,
            coachId,
            structuredTags: mock.tags,
          });
        }, 1000 + i * 800);
      });
    } else {
      setTimeout(() => {
        addMessage({
          role: 'assistant',
          content: `我理解你的问题关于「${userInput}」。让我从多个角度为你分析这个问题...\n\n这是一个很好的思考方向，建议你可以从以下几个方面入手：\n\n1. 明确目标和关键指标\n2. 分析当前资源和约束条件\n3. 制定可执行的行动计划`,
        });
      }, 800);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-card rounded-2xl border border-border shadow-sm">
        {/* Input area */}
        <div className="flex items-end gap-2 p-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="咨询任何问题"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[36px] max-h-[120px] py-2"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim()}
            className="h-8 w-8 rounded-full bg-foreground text-background hover:bg-foreground/90"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-0">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground gap-1">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              工具
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">默认</span>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-secondary/50 text-muted-foreground/60">私有化</span>
            <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
              AIYOU-记忆模型
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
