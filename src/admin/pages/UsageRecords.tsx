import { useState } from "react";
import { useUsageRecords } from "@/admin/hooks/useBilling";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2 } from "lucide-react";

export default function UsageRecords() {
  const [search, setSearch] = useState("");
  const { data: records = [], isLoading } = useUsageRecords();

  const filtered = records.filter(r => (r.username ?? "").includes(search) || (r.agent_name ?? "").includes(search));

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input placeholder="搜索用户名/Agent名称" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
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
