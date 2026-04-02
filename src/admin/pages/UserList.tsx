import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers, useToggleUserStatus } from "@/admin/hooks/useUsers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Ban, CheckCircle, Loader2 } from "lucide-react";

export default function UserList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: users = [], isLoading } = useUsers();
  const toggleStatus = useToggleUserStatus();

  const filtered = users.filter(u =>
    u.username.includes(search) || (u.phone ?? "").includes(search) || (u.email ?? "").includes(search)
  );

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input placeholder="搜索用户名/手机号/邮箱" value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户名</TableHead>
              <TableHead>手机号</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>Token已用</TableHead>
              <TableHead>余额</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-neutral-500">暂无数据</TableCell></TableRow>
            ) : filtered.map(user => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className={user.status === 'active' ? 'bg-neutral-900' : ''}>
                    {user.status === 'active' ? '正常' : '封禁'}
                  </Badge>
                </TableCell>
                <TableCell>{user.token_used.toLocaleString()}</TableCell>
                <TableCell>{user.token_balance.toLocaleString()}</TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/admin/users/${user.user_id}`)}>详情</Button>
                    <Button size="sm" variant={user.status === 'active' ? 'destructive' : 'default'} onClick={() => toggleStatus.mutate({ userId: user.user_id, status: user.status })}>
                      {user.status === 'active' ? <><Ban className="h-3 w-3 mr-1" />封禁</> : <><CheckCircle className="h-3 w-3 mr-1" />解封</>}
                    </Button>
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
