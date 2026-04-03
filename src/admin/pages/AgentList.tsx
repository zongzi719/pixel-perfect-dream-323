import { useNavigate } from "react-router-dom";
import { useAgents, useToggleAgent } from "@/admin/hooks/useAgents";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2, Pencil } from "lucide-react";

export default function AgentList() {
  const navigate = useNavigate();
  const { data: agents = [], isLoading } = useAgents();
  const toggleAgent = useToggleAgent();

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-neutral-500 text-sm">管理AI Agent及其配置</p>
        <Button className="bg-neutral-900 hover:bg-neutral-800" onClick={() => navigate("/admin/agents/new")}>
          <Plus className="h-4 w-4 mr-2" />创建Agent
        </Button>
      </div>
      {agents.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">暂无Agent，请创建</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <Card key={agent.id} className="border-neutral-200">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{agent.avatar}</span>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{agent.name}</h3>
                      <p className="text-xs text-neutral-500">{agent.name_en}</p>
                    </div>
                  </div>
                  <Switch checked={agent.enabled} onCheckedChange={() => toggleAgent.mutate({ id: agent.id, enabled: agent.enabled })} />
                </div>
                <p className="text-sm text-neutral-600 mb-3">{agent.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {(agent.tags ?? []).map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-500">
                  <span>视角: {agent.perspective}</span>
                  <div className="flex items-center gap-2">
                    <span>使用: {agent.usage_count.toLocaleString()}次</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/admin/agents/${agent.id}/edit`)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
