import { useState } from "react";
import { useAdminUsers } from "@/admin/hooks/useAdminAuth";
import { useRoles } from "@/admin/hooks/useRoles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Loader2 } from "lucide-react";

export default function AdminManage() {
  const [open, setOpen] = useState(false);
  const { data: admins = [], isLoading } = useAdminUsers();
  const { data: roles = [] } = useRoles();

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-neutral-500 text-sm">管理后台管理员账号</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-neutral-900 hover:bg-neutral-800"><Plus className="h-4 w-4 mr-2" />添加管理员</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>添加管理员</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>用户名</Label><Input placeholder="请输入用户名" /></div>
              <div><Label>邮箱</Label><Input placeholder="请输入邮箱" /></div>
              <div>
                <Label>角色</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="选择角色" /></SelectTrigger>
                  <SelectContent>
                    {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-neutral-900" onClick={() => setOpen(false)}>添加</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户名</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>最后登录</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-neutral-500">暂无管理员</TableCell></TableRow>
            ) : admins.map(admin => (
              <TableRow key={admin.id}>
                <TableCell className="font-medium">{admin.username}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell><Badge variant="outline">{admin.role}</Badge></TableCell>
                <TableCell><Badge className="bg-neutral-900">{admin.status === 'active' ? '正常' : '禁用'}</Badge></TableCell>
                <TableCell>{admin.last_login ? new Date(admin.last_login).toLocaleDateString() : '-'}</TableCell>
                <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                <TableCell><Button size="sm" variant="outline"><Edit className="h-3 w-3" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
