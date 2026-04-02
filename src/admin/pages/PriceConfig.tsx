import { useState } from "react";
import { useTokenPrices, useUpdateTokenPrice, useCreateTokenPrice } from "@/admin/hooks/useBilling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export default function PriceConfig() {
  const { data: prices = [], isLoading } = useTokenPrices();
  const updatePrice = useUpdateTokenPrice();
  const createPrice = useCreateTokenPrice();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "", model: "", input_price: "", output_price: "", unit: "元/千Token" });

  const handleCreate = () => {
    createPrice.mutate({
      type: form.type,
      model: form.model,
      input_price: parseFloat(form.input_price) || 0,
      output_price: parseFloat(form.output_price) || 0,
      unit: form.unit,
    }, {
      onSuccess: () => { setOpen(false); setForm({ type: "", model: "", input_price: "", output_price: "", unit: "元/千Token" }); toast.success("价格配置已创建"); }
    });
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>;

  return (
    <div className="space-y-6">
      <Card className="border-neutral-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Token价格配置</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-neutral-900 hover:bg-neutral-800"><Plus className="h-4 w-4 mr-1" />新增价格</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>新增价格配置</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>类型</Label><Input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} placeholder="如：文本" /></div>
                  <div><Label>模型</Label><Input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="如：GPT-4" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>输入价格</Label><Input type="number" value={form.input_price} onChange={e => setForm(f => ({ ...f, input_price: e.target.value }))} placeholder="0" /></div>
                  <div><Label>输出价格</Label><Input type="number" value={form.output_price} onChange={e => setForm(f => ({ ...f, output_price: e.target.value }))} placeholder="0" /></div>
                </div>
                <div><Label>单位</Label><Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} /></div>
                <Button className="w-full bg-neutral-900" onClick={handleCreate} disabled={createPrice.isPending}>创建</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {prices.length === 0 ? (
            <p className="text-center text-neutral-500 py-4">暂无价格配置</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>类型</TableHead>
                  <TableHead>模型</TableHead>
                  <TableHead>输入价格</TableHead>
                  <TableHead>输出价格</TableHead>
                  <TableHead>单位</TableHead>
                  <TableHead>更新时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prices.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.type}</TableCell>
                    <TableCell>{p.model}</TableCell>
                    <TableCell>
                      <Input type="number" defaultValue={p.input_price} className="w-24"
                        onBlur={e => updatePrice.mutate({ id: p.id, input_price: parseFloat(e.target.value) || 0, output_price: p.output_price })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" defaultValue={p.output_price} className="w-24"
                        onBlur={e => updatePrice.mutate({ id: p.id, input_price: p.input_price, output_price: parseFloat(e.target.value) || 0 })} />
                    </TableCell>
                    <TableCell>{p.unit}</TableCell>
                    <TableCell>{new Date(p.updated_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-neutral-200">
        <CardHeader><CardTitle className="text-base">数据保留策略</CardTitle></CardHeader>
        <CardContent className="flex items-center gap-4">
          <span className="text-sm text-neutral-600">对话记录保留时间：</span>
          <Input type="number" defaultValue={90} className="w-24" />
          <span className="text-sm text-neutral-500">天</span>
        </CardContent>
      </Card>

      <Button className="bg-neutral-900 hover:bg-neutral-800" onClick={() => toast.success("价格配置已保存")}>保存配置</Button>
    </div>
  );
}
