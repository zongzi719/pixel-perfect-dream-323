import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations, useFlagConversation } from "@/admin/hooks/useContent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Flag, Loader2 } from "lucide-react";

const statusMap: Record<string, string> = { normal: '正常', flagged: '违规', deleted: '已删除' };
const statusVariant: Record<string, 'outline' | 'destructive' | 'secondary'> = { normal: 'outline', flagged: 'destructive', deleted: 'secondary' };

export default function ContentList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: conversations = [], isLoading } = useConversations();
  const flagConv = useFlagConversation();

  const filtered = conversations.filter(c => (c.username ?? "").includes(search) || (c.agent_name ?? "").includes(search));

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
              <TableHead>Agent</TableHead>
              <TableHead>消息数</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>最后消息</TableHead>
              <TableHead>更新时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-neutral-500">暂无数据</TableCell></TableRow>
            ) : filtered.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.username}</TableCell>
                <TableCell>{c.agent_name}</TableCell>
                <TableCell>{c.message_count}</TableCell>
                <TableCell><Badge variant={statusVariant[c.status] || 'outline'}>{statusMap[c.status] || c.status}</Badge></TableCell>
                <TableCell className="max-w-48 truncate">{c.last_message}</TableCell>
                <TableCell>{new Date(c.updated_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/admin/content/${c.id}`)}>查看</Button>
                    <Button size="sm" variant="outline" onClick={() => flagConv.mutate(c.id)}><Flag className="h-3 w-3" /></Button>
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
