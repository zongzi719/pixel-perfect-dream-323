import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!phone || !password) { toast.error("请输入手机号和密码"); return; }
    if (password !== confirm) { toast.error("两次密码不一致"); return; }
    if (password.length < 6) { toast.error("密码至少6位"); return; }
    setLoading(true);
    try {
      await signUp(phone, password);
      toast.success("注册成功，请登录");
      navigate("/login");
    } catch (e: any) {
      toast.error(e.message || "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-10"
        style={{ background: "linear-gradient(135deg, hsl(230, 40%, 92%) 0%, hsl(245, 50%, 88%) 40%, hsl(220, 60%, 85%) 100%)" }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {[500, 400, 300, 200].map((size, i) => (
            <div key={i} className="absolute rounded-full border" style={{ width: size, height: size, top: `calc(50% - ${size / 2}px)`, left: `calc(50% - ${size / 2}px)`, borderColor: `hsla(230, 50%, 75%, ${0.15 + i * 0.08})` }} />
          ))}
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-foreground/60 hover:text-foreground transition-colors"><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /><span className="text-lg font-bold text-foreground">AI YOU</span></div>
        </div>
        <div className="relative z-10 flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-primary" /><h1 className="text-4xl font-bold text-foreground tracking-wide">AI YOU</h1></div>
          <p className="text-xl text-foreground/70 font-medium">你的思维，从此多一个你。</p>
        </div>
        <div className="relative z-10 text-center"><p className="text-sm text-foreground/50">一个理解你决策逻辑的AI分身，帮助你分析与决策</p></div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 relative">
          <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-2xl">
            <div className="absolute -top-8 -right-8 w-16 h-16 rotate-45 bg-primary/10" />
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-8">注册 AI YOU</h2>

          <div className="space-y-4">
            <Input placeholder="请输入手机号" value={phone} onChange={e => setPhone(e.target.value)} />
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} placeholder="请设置密码（至少6位）" value={password} onChange={e => setPassword(e.target.value)} className="pr-10" />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Input type={showPassword ? "text" : "password"} placeholder="请确认密码" value={confirm} onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRegister(); }} />
          </div>

          <Button className="w-full mt-6 h-11 text-base font-medium bg-foreground text-background hover:bg-foreground/90" onClick={handleRegister} disabled={loading}>
            {loading ? "注册中..." : "立即注册"}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">已有账号？<Link to="/login" className="text-primary hover:underline ml-1">去登录</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
