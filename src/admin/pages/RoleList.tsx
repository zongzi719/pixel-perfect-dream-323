import { useState } from "react";
import { mockRoles } from "@/admin/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function RoleList() {
  const [roles, setRoles] = useState(mockRoles);
  const [open, setOpen] = useState(false);

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
              <div><Label>角色名称</Label><Input placeholder="请输入角色名称" /></div>
              <div><Label>描述</Label><Textarea placeholder="请输入角色描述" /></div>
              <Button className="w-full bg-neutral-900" onClick={() => setOpen(false)}>创建</Button>
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
            {roles.map(role => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell><Badge variant="outline">{role.permissions.length === 1 && role.permissions[0] === 'all' ? '全部' : role.permissions.length}</Badge></TableCell>
                <TableCell>{role.memberCount}</TableCell>
                <TableCell>{role.createdAt}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><Edit className="h-3 w-3" /></Button>
                    <Button size="sm" variant="outline" className="text-red-600"><Trash2 className="h-3 w-3" /></Button>
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
