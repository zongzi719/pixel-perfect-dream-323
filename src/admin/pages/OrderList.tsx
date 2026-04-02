import { useState } from "react";
import { mockOrders } from "@/admin/data/mockData";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

const statusMap = { paid: '已支付', pending: '待支付', refunded: '已退款' };
const statusClass = { paid: 'bg-neutral-900', pending: 'bg-amber-500', refunded: 'bg-neutral-400' };

export default function OrderList() {
  const [search, setSearch] = useState("");

  const filtered = mockOrders.filter(o => o.username.includes(search) || o.planName.includes(search));

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input placeholder="搜索用户名/套餐名" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
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
            {filtered.map(order => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">{order.id}</TableCell>
                <TableCell>{order.username}</TableCell>
                <TableCell>{order.planName}</TableCell>
                <TableCell className="font-medium">¥{order.amount}</TableCell>
                <TableCell><Badge className={statusClass[order.status]}>{statusMap[order.status]}</Badge></TableCell>
                <TableCell>{order.payMethod}</TableCell>
                <TableCell>{order.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
