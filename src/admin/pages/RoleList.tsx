import { useState } from "react";
import { useRoles, useCreateRole, useDeleteRole } from "@/admin/hooks/useRoles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

export default function RoleList() {
  const { data: roles = [], isLoading } = useRoles();
  const createRole = useCreateRole();
  const deleteRole = useDeleteRole();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    createRole.mutate({ name, description, permissions: [] as unknown as Json }, {
      onSuccess: () => { setOpen(false); setName(""); setDescription(""); }
    });
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-neutral-500 text-sm">管理系统角色和权限分配</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-neutral-900 hover:bg-neutral-800"><Plus className="h-4 w-4 mr-2" />新建角色</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>新建角色</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>角色名称</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="请输入角色名称" /></div>
              <div><Label>描述</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="请输入角色描述" /></div>
              <Button className="w-full bg-neutral-900" onClick={handleCreate} disabled={createRole.isPending}>创建</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>角色名称</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>权限数</TableHead>
              <TableHead>成员数</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-neutral-500">暂无角色</TableCell></TableRow>
            ) : roles.map(role => {
              const perms = Array.isArray(role.permissions) ? role.permissions : [];
              return (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell><Badge variant="outline">{perms.length === 1 && perms[0] === 'all' ? '全部' : perms.length}</Badge></TableCell>
                  <TableCell>{role.member_count}</TableCell>
                  <TableCell>{new Date(role.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline"><Edit className="h-3 w-3" /></Button>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteRole.mutate(role.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
