import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import mobileBg from "@/assets/mobile-bg.jpg";

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
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden">
      {/* Background */}
      <img src={mobileBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 px-8">
        {/* Back */}
        <div className="pt-14">
          <button onClick={() => navigate(-1)} className="text-white/60 active:text-white">
            <ArrowLeft size={22} />
          </button>
        </div>

        {/* Title */}
        <div className="flex flex-col items-center pt-8 pb-12">
          <h1 className="text-3xl font-light tracking-[0.3em] text-white">AI YOU</h1>
          <p className="text-white/60 text-sm mt-2">注册新账号</p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-0">
          <div className="border-b border-white/15">
            <input
              type="tel"
              placeholder="手机号"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full h-[52px] bg-transparent text-white text-base placeholder:text-white/40 focus:outline-none"
            />
          </div>
          <div className="border-b border-white/15 relative">
            <input
              type={showPwd ? "text" : "password"}
              placeholder="设置密码（至少6位）"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-[52px] bg-transparent text-white text-base placeholder:text-white/40 pr-12 focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white/40"
              onClick={() => setShowPwd(!showPwd)}
            >
              {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="border-b border-white/15">
            <input
              type={showPwd ? "text" : "password"}
              placeholder="确认密码"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleRegister(); }}
              className="w-full h-[52px] bg-transparent text-white text-base placeholder:text-white/40 focus:outline-none"
            />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Register button */}
        <div className="pb-10 flex flex-col items-center gap-4">
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full h-[52px] rounded-full bg-white text-black text-base font-medium active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "注册中..." : "立即注册"}
          </button>
          <p className="text-xs text-white/40">
            已有账号？
            <Link to="/m/login" className="text-white/70 ml-1">去登录</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
