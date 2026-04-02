import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, User } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.03),transparent_50%)]" />
      <Card className="w-full max-w-sm border-neutral-800 bg-neutral-900 shadow-2xl relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-white flex items-center justify-center">
            <span className="text-lg font-bold text-neutral-950">AI</span>
          </div>
          <CardTitle className="text-xl text-white">AI YOU 管理后台</CardTitle>
          <CardDescription className="text-neutral-400">请输入管理员账号登录</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-neutral-300">用户名</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-white/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-300">密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus-visible:ring-white/20"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-white text-neutral-950 hover:bg-neutral-200 font-medium">
              登录
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
