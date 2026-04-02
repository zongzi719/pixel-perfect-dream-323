import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockAgents } from "@/admin/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";

export default function AgentList() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState(mockAgents);

  const toggleAgent = (id: string) => {
    setAgents(agents.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-neutral-500 text-sm">管理AI Agent及其配置</p>
        <Button className="bg-neutral-900 hover:bg-neutral-800" onClick={() => navigate("/admin/agents/new")}>
          <Plus className="h-4 w-4 mr-2" />创建Agent
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(agent => (
          <Card key={agent.id} className="border-neutral-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agent.avatar}</span>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{agent.name}</h3>
                    <p className="text-xs text-neutral-500">{agent.nameEn}</p>
                  </div>
                </div>
                <Switch checked={agent.enabled} onCheckedChange={() => toggleAgent(agent.id)} />
              </div>
              <p className="text-sm text-neutral-600 mb-3">{agent.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {agent.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>视角: {agent.perspective}</span>
                <span>使用: {agent.usageCount.toLocaleString()}次</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
