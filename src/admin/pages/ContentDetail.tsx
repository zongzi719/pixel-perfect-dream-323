import { useParams, useNavigate } from "react-router-dom";
import { useConversation } from "@/admin/hooks/useContent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Flag, Trash2, Loader2 } from "lucide-react";

export default function ContentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: conversation, isLoading } = useConversation(id);

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>;
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
              <p className="text-sm text-neutral-500 mt-1">用户: {conversation.username} · Agent: {conversation.agent_name}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-amber-600"><Flag className="h-3 w-3 mr-1" />标记违规</Button>
              <Button size="sm" variant="destructive"><Trash2 className="h-3 w-3 mr-1" />删除对话</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-500 text-center py-8">对话消息内容将在消息表建立后展示</p>
        </CardContent>
      </Card>
    </div>
  );
}
