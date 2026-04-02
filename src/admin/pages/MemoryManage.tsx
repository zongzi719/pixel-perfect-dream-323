import { useMemoryConfigs, useToggleAutoExtract } from "@/admin/hooks/useMemory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function MemoryManage() {
  const { data: configs = [], isLoading } = useMemoryConfigs();
  const toggleAutoExtract = useToggleAutoExtract();

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>;

  return (
    <div className="space-y-6">
      <Card className="border-neutral-200">
        <CardHeader><CardTitle className="text-base">全局记忆配置</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-neutral-600">默认最大记忆数</label>
              <Input type="number" defaultValue={100} className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-neutral-600">默认保留天数</label>
              <Input type="number" defaultValue={90} className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-neutral-600">自动提取</label>
              <div className="mt-3"><Switch defaultChecked /></div>
            </div>
          </div>
          <Button className="bg-neutral-900 hover:bg-neutral-800" onClick={() => toast.success("全局配置已保存")}>保存全局配置</Button>
        </CardContent>
      </Card>

      <Card className="border-neutral-200">
        <CardHeader><CardTitle className="text-base">用户记忆列表</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户</TableHead>
                <TableHead>记忆数</TableHead>
                <TableHead>使用率</TableHead>
                <TableHead>保留天数</TableHead>
                <TableHead>自动提取</TableHead>
                <TableHead>最后更新</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-neutral-500">暂无数据</TableCell></TableRow>
              ) : configs.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.username}</TableCell>
                  <TableCell>{c.memory_count}/{c.max_memory}</TableCell>
                  <TableCell className="w-32">
                    <Progress value={(c.memory_count / c.max_memory) * 100} className="h-2" />
                  </TableCell>
                  <TableCell>{c.retention_days}天</TableCell>
                  <TableCell>
                    <Switch checked={c.auto_extract} onCheckedChange={() => toggleAutoExtract.mutate({ id: c.id, auto_extract: c.auto_extract })} />
                  </TableCell>
                  <TableCell>{new Date(c.last_updated).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
