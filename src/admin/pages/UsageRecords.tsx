import { useState } from "react";
import { mockUsageRecords } from "@/admin/data/mockData";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

export default function UsageRecords() {
  const [search, setSearch] = useState("");

  const filtered = mockUsageRecords.filter(r => r.username.includes(search) || r.agentName.includes(search));

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
            {filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.username}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.agentName}</TableCell>
                <TableCell>{r.tokensInput.toLocaleString()}</TableCell>
                <TableCell>{r.tokensOutput.toLocaleString()}</TableCell>
                <TableCell>¥{r.cost.toFixed(3)}</TableCell>
                <TableCell>{r.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
