import { useTokenPrices, useUpdateTokenPrice } from "@/admin/hooks/useBilling";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PriceConfig() {
  const { data: prices = [], isLoading } = useTokenPrices();
  const updatePrice = useUpdateTokenPrice();

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>;

  return (
    <div className="space-y-6">
      <Card className="border-neutral-200">
        <CardHeader><CardTitle className="text-base">Token价格配置</CardTitle></CardHeader>
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
