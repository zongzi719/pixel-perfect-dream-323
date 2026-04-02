import { useState } from "react";
import { mockPlans } from "@/admin/data/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit } from "lucide-react";

export default function PlanManage() {
  const [plans, setPlans] = useState(mockPlans);
  const [open, setOpen] = useState(false);

  const togglePlan = (id: string) => {
    setPlans(plans.map(p => p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' as const : 'active' as const } : p));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-neutral-500 text-sm">管理订阅套餐和次卡</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-neutral-900 hover:bg-neutral-800"><Plus className="h-4 w-4 mr-2" />新建套餐</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>新建套餐</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>套餐名称</Label><Input placeholder="请输入套餐名称" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>价格(元)</Label><Input type="number" placeholder="0" /></div>
                <div><Label>Token额度</Label><Input type="number" placeholder="0" /></div>
              </div>
              <Button className="w-full bg-neutral-900" onClick={() => setOpen(false)}>创建</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map(plan => (
          <Card key={plan.id} className="border-neutral-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-neutral-900">{plan.name}</h3>
                  <Badge variant="outline" className="mt-1">{plan.type === 'subscription' ? '订阅' : '次卡'}</Badge>
                </div>
                <Switch checked={plan.status === 'active'} onCheckedChange={() => togglePlan(plan.id)} />
              </div>
              <div className="text-2xl font-bold text-neutral-900 mb-2">¥{plan.price}<span className="text-sm font-normal text-neutral-500">/{plan.duration}</span></div>
              <p className="text-sm text-neutral-500 mb-2">Token额度: {plan.tokens.toLocaleString()}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {plan.features.map(f => <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>)}
              </div>
              <div className="flex justify-between text-xs text-neutral-500">
                <span>订阅用户: {plan.subscribers}</span>
                <Button size="sm" variant="ghost"><Edit className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
