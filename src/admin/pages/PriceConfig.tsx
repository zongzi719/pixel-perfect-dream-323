import { useState } from "react";
import { mockTokenPrices } from "@/admin/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

export default function PriceConfig() {
  const [prices, setPrices] = useState(mockTokenPrices);

  const updatePrice = (id: string, field: 'inputPrice' | 'outputPrice', value: string) => {
    setPrices(prices.map(p => p.id === id ? { ...p, [field]: parseFloat(value) || 0 } : p));
  };

  return (
    <div className="space-y-6">
      <Card className="border-neutral-200">
        <CardHeader><CardTitle className="text-base">Token价格配置</CardTitle></CardHeader>
        <CardContent>
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
                  <TableCell><Input type="number" value={p.inputPrice} onChange={e => updatePrice(p.id, 'inputPrice', e.target.value)} className="w-24" /></TableCell>
                  <TableCell><Input type="number" value={p.outputPrice} onChange={e => updatePrice(p.id, 'outputPrice', e.target.value)} className="w-24" /></TableCell>
                  <TableCell>{p.unit}</TableCell>
                  <TableCell>{p.updatedAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
