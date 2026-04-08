import { useState } from "react";
import { useNavigate } from "react-router-dom";
import mobileBg from "@/assets/mobile-bg.jpg";

export default function MobileSplash() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const handleLogin = () => {
    if (!agreed) return;
    navigate("/m/login");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden">
      {/* Background */}
      <img
        src={mobileBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 px-8">
        {/* Brand - upper area */}
        <div className="flex flex-col items-center pt-[28vh]">
          <h1 className="text-3xl font-light tracking-[0.3em] text-white">
            AI YOU
          </h1>
          <p className="text-white/70 text-base mt-3 tracking-wide">
            "你的思维，从此多一个你"
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom actions */}
        <div className="pb-10 flex flex-col items-center gap-5">
          <button
            onClick={handleLogin}
            className={`w-full h-[52px] rounded-full bg-white text-black text-base font-medium active:scale-[0.98] transition-all ${
              !agreed ? "opacity-40" : "opacity-100"
            }`}
          >
            账号登录
          </button>

          <label className="flex items-center gap-2 text-xs text-white/50">
            <span
              onClick={() => setAgreed(!agreed)}
              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                agreed
                  ? "border-white/80 bg-white/20"
                  : "border-white/30 bg-transparent"
              }`}
            >
              {agreed && (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </span>
            <span onClick={() => setAgreed(!agreed)}>
              我已阅读并同意《用户协议》和《隐私政策》
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
