import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function MobileRegister() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!phone || !password) { toast.error("请输入手机号和密码"); return; }
    if (password !== confirm) { toast.error("两次密码不一致"); return; }
    if (password.length < 6) { toast.error("密码至少6位"); return; }
    setLoading(true);
    try {
      await signUp(phone, password);
      toast.success("注册成功，请登录");
      navigate("/m/login");
    } catch (e: any) {
      toast.error(e.message || "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background px-6 pt-safe-top">
      {/* Header */}
      <div className="pt-4">
        <button onClick={() => navigate(-1)} className="text-muted-foreground active:text-foreground">
          <ArrowLeft size={22} />
        </button>
      </div>

      <div className="flex flex-col items-center pt-10 pb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <span className="text-primary-foreground text-xl font-bold">AI</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">注册 AI YOU</h1>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <input
          type="tel"
          placeholder="请输入手机号"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="h-12 w-full rounded-xl border border-input bg-card px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="relative">
          <input
            type={showPwd ? "text" : "password"}
            placeholder="请设置密码（至少6位）"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="h-12 w-full rounded-xl border border-input bg-card px-4 pr-12 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={() => setShowPwd(!showPwd)}
          >
            {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <input
          type={showPwd ? "text" : "password"}
          placeholder="请确认密码"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleRegister(); }}
          className="h-12 w-full rounded-xl border border-input bg-card px-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="h-12 w-full rounded-xl bg-foreground text-background text-base font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 mt-2"
        >
          {loading ? "注册中..." : "立即注册"}
        </button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          已有账号？
          <Link to="/m/login" className="text-primary font-medium ml-1">去登录</Link>
        </p>
      </div>
    </div>
  );
}
