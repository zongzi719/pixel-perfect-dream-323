import { useState } from "react";
import { useUsageRecords, useCreateUsageRecord } from "@/admin/hooks/useBilling";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Loader2, Plus } from "lucide-react";

export default function UsageRecords() {
  const [search, setSearch] = useState("");
  const { data: records = [], isLoading } = useUsageRecords();
  const createRecord = useCreateUsageRecord();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: "", user_id: "", type: "文本", agent_name: "", tokens_input: "", tokens_output: "", cost: "" });

  const filtered = records.filter(r => (r.username ?? "").includes(search) || (r.agent_name ?? "").includes(search));

  const handleCreate = () => {
    createRecord.mutate({
      user_id: form.user_id,
      username: form.username,
      type: form.type,
      agent_name: form.agent_name,
      tokens_input: parseInt(form.tokens_input) || 0,
      tokens_output: parseInt(form.tokens_output) || 0,
      cost: parseFloat(form.cost) || 0,
    }, {
      onSuccess: () => { setOpen(false); setForm({ username: "", user_id: "", type: "文本", agent_name: "", tokens_input: "", tokens_output: "", cost: "" }); }
    });
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input placeholder="搜索用户名/Agent名称" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-neutral-900 hover:bg-neutral-800"><Plus className="h-4 w-4 mr-1" />新增记录</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>新增消费记录</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>用户名</Label><Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
                <div><Label>用户ID</Label><Input value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))} placeholder="UUID" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>类型</Label><Input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} /></div>
                <div><Label>Agent名称</Label><Input value={form.agent_name} onChange={e => setForm(f => ({ ...f, agent_name: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label>输入Token</Label><Input type="number" value={form.tokens_input} onChange={e => setForm(f => ({ ...f, tokens_input: e.target.value }))} /></div>
                <div><Label>输出Token</Label><Input type="number" value={form.tokens_output} onChange={e => setForm(f => ({ ...f, tokens_output: e.target.value }))} /></div>
                <div><Label>费用(元)</Label><Input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} /></div>
              </div>
              <Button className="w-full bg-neutral-900" onClick={handleCreate} disabled={createRecord.isPending}>创建</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>输入Token</TableHead>
              <TableHead>输出Token</TableHead>
              <TableHead>费用(元)</TableHead>
              <TableHead>时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-neutral-500">暂无记录</TableCell></TableRow>
            ) : filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.username}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.agent_name}</TableCell>
                <TableCell>{r.tokens_input.toLocaleString()}</TableCell>
                <TableCell>{r.tokens_output.toLocaleString()}</TableCell>
                <TableCell>¥{r.cost.toFixed(3)}</TableCell>
                <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
