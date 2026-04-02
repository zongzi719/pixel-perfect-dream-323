import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateAgent } from "@/admin/hooks/useAgents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function AgentCreate() {
  const navigate = useNavigate();
  const createAgent = useCreateAgent();
  const [name, setName] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [perspective, setPerspective] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");

  const handleSave = () => {
    createAgent.mutate({
      name,
      name_en: nameEn,
      perspective,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      description,
      system_prompt: systemPrompt,
    }, {
      onSuccess: () => { toast.success("Agent创建成功"); navigate("/admin/agents"); },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Button variant="ghost" onClick={() => navigate("/admin/agents")} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> 返回Agent列表
      </Button>
      <Card className="border-neutral-200">
        <CardHeader><CardTitle>创建新Agent</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>名称</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="如：战略顾问" /></div>
            <div><Label>英文名</Label><Input value={nameEn} onChange={e => setNameEn(e.target.value)} placeholder="如：Strategy Advisor" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>视角</Label>
              <Select value={perspective} onValueChange={setPerspective}>
                <SelectTrigger><SelectValue placeholder="选择视角" /></SelectTrigger>
                <SelectContent>
                  {['战略', '风险', '产品', '数据', '创新', '运营', '财务'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>标签（逗号分隔）</Label><Input value={tags} onChange={e => setTags(e.target.value)} placeholder="战略,规划,商业模式" /></div>
          </div>
          <div><Label>描述</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Agent的功能描述" rows={3} /></div>
          <div><Label>System Prompt</Label><Textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} placeholder="Agent的系统提示词" rows={6} /></div>
          <div className="flex gap-3">
            <Button className="bg-neutral-900 hover:bg-neutral-800" onClick={handleSave} disabled={createAgent.isPending}>创建Agent</Button>
            <Button variant="outline" onClick={() => navigate("/admin/agents")}>取消</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
