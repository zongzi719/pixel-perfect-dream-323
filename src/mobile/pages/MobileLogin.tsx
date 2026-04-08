import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function MobileLogin() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) { toast.error("请输入手机号和密码"); return; }
    setLoading(true);
    try {
      await signIn(phone, password);
      toast.success("登录成功");
      navigate("/m");
    } catch (e: any) {
      toast.error(e.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background px-6 pt-safe-top">
      {/* Brand */}
      <div className="flex flex-col items-center pt-20 pb-10">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <span className="text-primary-foreground text-xl font-bold">AI</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">AI YOU</h1>
        <p className="text-sm text-muted-foreground mt-1">你的思维，从此多一个你</p>
      </div>

      {/* Form */}
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
            placeholder="请输入密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
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

        <button
          onClick={handleLogin}
          disabled={loading}
          className="h-12 w-full rounded-xl bg-foreground text-background text-base font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 mt-2"
        >
          {loading ? "登录中..." : "立即登录"}
        </button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          没有账号？
          <Link to="/m/register" className="text-primary font-medium ml-1">立即注册</Link>
        </p>
      </div>

      <p className="text-center text-xs text-muted-foreground/60 pb-8 pt-4">
        登录即视为同意《用户隐私协议》
      </p>
    </div>
  );
}
