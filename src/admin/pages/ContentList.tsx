import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockConversations } from "@/admin/data/mockData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Flag, Trash2 } from "lucide-react";

const statusMap = { normal: '正常', flagged: '违规', deleted: '已删除' };
const statusVariant = { normal: 'outline' as const, flagged: 'destructive' as const, deleted: 'secondary' as const };

export default function ContentList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState(mockConversations);

  const filtered = conversations.filter(c => c.username.includes(search) || c.agentName.includes(search));

  const flag = (id: string) => {
    setConversations(conversations.map(c => c.id === id ? { ...c, status: 'flagged' as const } : c));
  };

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
              <TableHead>Agent</TableHead>
              <TableHead>消息数</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>最后消息</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.username}</TableCell>
                <TableCell>{c.agentName}</TableCell>
                <TableCell>{c.messageCount}</TableCell>
                <TableCell><Badge variant={statusVariant[c.status]}>{statusMap[c.status]}</Badge></TableCell>
                <TableCell className="max-w-48 truncate">{c.lastMessage}</TableCell>
                <TableCell>{c.updatedAt}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/admin/content/${c.id}`)}>查看</Button>
                    <Button size="sm" variant="outline" onClick={() => flag(c.id)}><Flag className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
