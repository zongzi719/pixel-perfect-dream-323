import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import mobileBg from "@/assets/mobile-bg.jpg";

export default function MobileLogin() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [rememberPwd, setRememberPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      toast.error("请输入手机号和密码");
      return;
    }
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
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden">
      {/* Background */}
      <img
        src={mobileBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 px-8">
        {/* Brand */}
        <div className="flex flex-col items-center pt-[20vh] pb-12">
          <h1 className="text-3xl font-light tracking-[0.3em] text-white">
            AI YOU
          </h1>
          <p className="text-white/60 text-sm mt-2 tracking-wide">
            "你的思维，从此多一个你"
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-0">
          {/* Phone input */}
          <div className="border-b border-white/15">
            <input
              type="tel"
              placeholder="手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-[52px] bg-transparent text-white text-base placeholder:text-white/40 focus:outline-none"
            />
          </div>

          {/* Password input */}
          <div className="border-b border-white/15 relative">
            <input
              type={showPwd ? "text" : "password"}
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
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

          {/* Remember & Forgot */}
          <div className="flex items-center justify-between mt-3">
            <label
              className="flex items-center gap-2 text-xs text-white/50"
              onClick={() => setRememberPwd(!rememberPwd)}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  rememberPwd
                    ? "border-white/60 bg-white/20"
                    : "border-white/30 bg-transparent"
                }`}
              >
                {rememberPwd && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </span>
              记住密码
            </label>
            <button className="text-xs text-white/50">忘记密码？</button>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Login button */}
        <div className="pb-10 flex flex-col items-center gap-4">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-[52px] rounded-full bg-white text-black text-base font-medium active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>

          <p className="text-xs text-white/40">
            没有账号？
            <Link to="/m/register" className="text-white/70 ml-1">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
