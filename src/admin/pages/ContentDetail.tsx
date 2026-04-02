import { useParams, useNavigate } from "react-router-dom";
import { mockConversations } from "@/admin/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Flag, Trash2 } from "lucide-react";

const mockMessages = [
  { role: 'user' as const, content: '请帮我分析一下当前市场环境下的竞争策略', time: '10:23' },
  { role: 'assistant' as const, content: '好的，我来从几个维度分析当前市场竞争环境：\n\n1. 市场格局：目前行业处于快速发展期...\n2. 竞争对手：主要竞品有A、B、C...\n3. 建议策略：差异化定位 + 技术壁垒', time: '10:24' },
  { role: 'user' as const, content: '差异化定位具体怎么做？', time: '10:25' },
  { role: 'assistant' as const, content: '差异化定位可以从以下几个方面入手：\n\n1. 产品功能差异化\n2. 用户体验差异化\n3. 价格策略差异化\n4. 品牌定位差异化', time: '10:26' },
];

export default function ContentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const conversation = mockConversations.find(c => c.id === id);

  if (!conversation) return <div className="text-center py-20 text-neutral-500">对话不存在</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <Button variant="ghost" onClick={() => navigate("/admin/content")} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> 返回对话列表
      </Button>

      <Card className="border-neutral-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">对话详情</CardTitle>
              <p className="text-sm text-neutral-500 mt-1">用户: {conversation.username} · Agent: {conversation.agentName}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-amber-600"><Flag className="h-3 w-3 mr-1" />标记违规</Button>
              <Button size="sm" variant="destructive"><Trash2 className="h-3 w-3 mr-1" />删除对话</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-900'}`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-neutral-400' : 'text-neutral-500'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
