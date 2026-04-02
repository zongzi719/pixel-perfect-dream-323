import { useState } from "react";
import { useOrders, useCreateOrder } from "@/admin/hooks/useBilling";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, Plus } from "lucide-react";

const statusMap: Record<string, string> = { paid: '已支付', pending: '待支付', refunded: '已退款' };
const statusClass: Record<string, string> = { paid: 'bg-neutral-900', pending: 'bg-amber-500', refunded: 'bg-neutral-400' };

export default function OrderList() {
  const [search, setSearch] = useState("");
  const { data: orders = [], isLoading } = useOrders();
  const createOrder = useCreateOrder();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: "", user_id: "", plan_name: "", amount: "", status: "pending", pay_method: "" });

  const filtered = orders.filter(o => (o.username ?? "").includes(search) || (o.plan_name ?? "").includes(search));

  const handleCreate = () => {
    createOrder.mutate({
      user_id: form.user_id,
      username: form.username,
      plan_name: form.plan_name,
      amount: parseFloat(form.amount) || 0,
      status: form.status,
      pay_method: form.pay_method,
    }, {
      onSuccess: () => { setOpen(false); setForm({ username: "", user_id: "", plan_name: "", amount: "", status: "pending", pay_method: "" }); }
    });
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input placeholder="搜索用户名/套餐名" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-neutral-900 hover:bg-neutral-800"><Plus className="h-4 w-4 mr-1" />新增订单</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>新增订单</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>用户名</Label><Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></div>
                <div><Label>用户ID</Label><Input value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))} placeholder="UUID" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>套餐名</Label><Input value={form.plan_name} onChange={e => setForm(f => ({ ...f, plan_name: e.target.value }))} /></div>
                <div><Label>金额(元)</Label><Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>状态</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">待支付</SelectItem>
                      <SelectItem value="paid">已支付</SelectItem>
                      <SelectItem value="refunded">已退款</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>支付方式</Label><Input value={form.pay_method} onChange={e => setForm(f => ({ ...f, pay_method: e.target.value }))} placeholder="微信/支付宝" /></div>
              </div>
              <Button className="w-full bg-neutral-900" onClick={handleCreate} disabled={createOrder.isPending}>创建</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单号</TableHead>
              <TableHead>用户</TableHead>
              <TableHead>套餐</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>支付方式</TableHead>
              <TableHead>创建时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-neutral-500">暂无订单</TableCell></TableRow>
            ) : filtered.map(order => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}</TableCell>
                <TableCell>{order.username}</TableCell>
                <TableCell>{order.plan_name}</TableCell>
                <TableCell className="font-medium">¥{order.amount}</TableCell>
                <TableCell><Badge className={statusClass[order.status] || ''}>{statusMap[order.status] || order.status}</Badge></TableCell>
                <TableCell>{order.pay_method}</TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
