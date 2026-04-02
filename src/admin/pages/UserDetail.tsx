import { useParams, useNavigate } from "react-router-dom";
import { mockUsers, mockUsageRecords } from "@/admin/data/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = mockUsers.find(u => u.id === id);

  if (!user) return <div className="text-center py-20 text-neutral-500">用户不存在</div>;

  const userRecords = mockUsageRecords.filter(r => r.userId === user.id);

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/admin/users")} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> 返回用户列表
      </Button>

      <Card className="border-neutral-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xl font-bold">{user.avatar}</div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">{user.username}</h2>
              <p className="text-neutral-500">{user.email} · {user.phone}</p>
              <Badge variant={user.status === 'active' ? 'default' : 'destructive'} className={user.status === 'active' ? 'bg-neutral-900 mt-1' : 'mt-1'}>
                {user.status === 'active' ? '正常' : '封禁'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">基本信息</TabsTrigger>
          <TabsTrigger value="usage">Token消耗</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <Card className="border-neutral-200">
            <CardContent className="p-6 grid grid-cols-2 gap-4">
              <div><p className="text-sm text-neutral-500">注册时间</p><p className="font-medium">{user.createdAt}</p></div>
              <div><p className="text-sm text-neutral-500">最后登录</p><p className="font-medium">{user.lastLogin}</p></div>
              <div><p className="text-sm text-neutral-500">Token已用</p><p className="font-medium">{user.tokenUsed.toLocaleString()}</p></div>
              <div><p className="text-sm text-neutral-500">Token余额</p><p className="font-medium">{user.tokenBalance.toLocaleString()}</p></div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="usage">
          <Card className="border-neutral-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>类型</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>输入Token</TableHead>
                    <TableHead>输出Token</TableHead>
                    <TableHead>费用(元)</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userRecords.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-neutral-500">暂无记录</TableCell></TableRow>
                  ) : userRecords.map(r => (
                    <TableRow key={r.id}>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
