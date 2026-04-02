import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowLeft, ChevronDown } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"code" | "password">("code");
  const [phone, setPhone] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* 左侧品牌区 */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-10"
        style={{
          background: "linear-gradient(135deg, hsl(230, 40%, 92%) 0%, hsl(245, 50%, 88%) 40%, hsl(220, 60%, 85%) 100%)"
        }}
      >
        {/* 同心圆装饰 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {[500, 400, 300, 200].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full border"
              style={{
                width: size,
                height: size,
                top: `calc(50% - ${size / 2}px)`,
                left: `calc(50% - ${size / 2}px)`,
                borderColor: `hsla(230, 50%, 75%, ${0.15 + i * 0.08})`,
              }}
            />
          ))}
        </div>

        {/* 顶部 Logo + 返回 */}
        <div className="relative z-10 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-foreground/60 hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-lg font-bold text-foreground">AI YOU</span>
          </div>
        </div>

        {/* 中间标题 */}
        <div className="relative z-10 flex flex-col items-center text-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-primary" />
            <h1 className="text-4xl font-bold text-foreground tracking-wide">AI YOU</h1>
          </div>
          <p className="text-xl text-foreground/70 font-medium">
            你的思维，从此多一个你。
          </p>
        </div>

        {/* 底部描述 */}
        <div className="relative z-10 text-center">
          <p className="text-sm text-foreground/50">
            一个理解你决策逻辑的AI分身，帮助你分析与决策
          </p>
        </div>
      </div>

      {/* 右侧登录区 */}
      <div className="flex-1 flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-lg p-8 relative">
          {/* 右上角装饰三角 */}
          <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-2xl">
            <div
              className="absolute -top-8 -right-8 w-16 h-16 rotate-45 bg-primary/10"
            />
          </div>

          {/* 标题 */}
          <h2 className="text-2xl font-bold text-foreground mb-8">
            欢迎使用 AI YOU
          </h2>

          {/* Tab 切换 */}
          <div className="flex gap-6 mb-6 border-b border-border">
            <button
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === "code"
                  ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("code")}
            >
              验证码登录
            </button>
            <button
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === "password"
                  ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab("password")}
            >
              密码登录
            </button>
          </div>

          {/* 验证码登录 */}
          {activeTab === "code" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button className="flex items-center gap-1 px-3 h-10 rounded-md border border-input bg-background text-sm text-foreground shrink-0">
                  +86 <ChevronDown size={14} />
                </button>
                <Input
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="请输入验证码"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                />
                <Button
                  variant="outline"
                  className="shrink-0 text-primary border-primary hover:bg-primary/5"
                >
                  获取验证码
                </Button>
              </div>
            </div>
          )}

          {/* 密码登录 */}
          {activeTab === "password" && (
            <div className="space-y-4">
              <Input
                placeholder="请输入手机号 / 邮箱"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end">
                <button className="text-xs text-primary hover:underline">
                  忘记密码？
                </button>
              </div>
            </div>
          )}

          {/* 记住我 */}
          <div className="flex items-center gap-2 mt-5">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(c) => setRememberMe(c === true)}
            />
            <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
              记住我的登录状态
            </label>
          </div>

          {/* 登录按钮 */}
          <Button
            className="w-full mt-6 h-11 text-base font-medium bg-foreground text-background hover:bg-foreground/90"
            onClick={handleLogin}
          >
            立即登录
          </Button>

          {/* 底部链接 */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              没有账号？
              <button className="text-primary hover:underline ml-1">立即注册</button>
            </p>
            <p className="text-xs text-muted-foreground/70">
              登录即视为同意
              <button className="text-primary hover:underline">《用户隐私协议》</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
