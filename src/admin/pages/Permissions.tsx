import { useState } from "react";
import { permissionGroups } from "@/admin/data/permissions";
import { useRoles, useUpdateRole } from "@/admin/hooks/useRoles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Permissions() {
  const { data: roles = [], isLoading } = useRoles();
  const updateRole = useUpdateRole();
  const [selectedRole, setSelectedRole] = useState<string>("");

  const role = roles.find(r => r.id === selectedRole) || roles[0];
  const perms = Array.isArray(role?.permissions) ? role.permissions as string[] : [];
  const isAll = perms.includes('all');

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-neutral-400" /></div>;
  if (roles.length === 0) return <div className="text-center py-20 text-neutral-500">请先创建角色</div>;

  const currentId = role?.id || "";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <p className="text-sm text-neutral-500">选择角色查看/编辑权限：</p>
        <Select value={currentId} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isAll ? (
        <Card className="border-neutral-200">
          <CardContent className="p-6 text-center text-neutral-500">该角色拥有全部权限</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {permissionGroups.map(group => (
            <Card key={group.module} className="border-neutral-200">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">{group.module}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {group.permissions.map(perm => (
                  <div key={perm.key} className="flex items-start gap-3">
                    <Checkbox id={perm.key} defaultChecked={perms.includes(perm.key)} />
                    <div>
                      <label htmlFor={perm.key} className="text-sm font-medium cursor-pointer">{perm.label}</label>
                      <p className="text-xs text-neutral-500">{perm.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button className="bg-neutral-900 hover:bg-neutral-800" onClick={() => toast.success("权限已保存")}>保存权限配置</Button>
    </div>
  );
}
