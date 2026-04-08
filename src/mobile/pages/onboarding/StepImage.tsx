import { useState, useRef, useEffect } from "react";
import { X, Plus, Check, Camera, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mobileBg from "@/assets/mobile-bg.jpg";

interface StepImageProps {
  onComplete: (generatedUrl: string) => void;
}

type Phase = "select" | "actionSheet" | "requirements" | "generating" | "result";

export default function StepImage({ onComplete }: StepImageProps) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [generatedAvatar, setGeneratedAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const totalSteps = 4;
  const currentStep = 2;
  const stepLabel = phase === "generating" || phase === "result" ? "生成数字形象" : "图像采集";

  const progressStages = [
    { label: "面部特征分析", threshold: 33 },
    { label: "生成虚拟形象身份", threshold: 66 },
    { label: "优化视觉风格", threshold: 100 },
  ];

  // Simulate generation progress
  useEffect(() => {
    if (phase !== "generating") return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setGeneratedAvatar(selectedImage);
            setPhase("result");
          }, 500);
          return 100;
        }
        return p + 1;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [phase, selectedImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
    setPhase("requirements");
  };

  const handleUploadAndGenerate = async () => {
    setPhase("generating");
  };

  const handleRegenerate = () => {
    setPhase("generating");
    setProgress(0);
  };

  const handleConfirm = () => {
    onComplete(generatedAvatar || "");
  };

  // Decorative floating avatars (placeholders)
  const decorativeAvatars = [
    { top: "22%", left: "15%", size: 44, blur: 2 },
    { top: "18%", right: "22%", size: 52, blur: 0 },
    { top: "35%", left: "5%", size: 36, blur: 3 },
    { top: "32%", right: "8%", size: 40, blur: 1 },
    { top: "45%", left: "22%", size: 48, blur: 1 },
    { top: "40%", right: "18%", size: 50, blur: 0 },
    { top: "28%", right: "38%", size: 38, blur: 2 },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden">
      <img src={mobileBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileSelect} />

      <div className="relative z-10 flex flex-col flex-1 px-6 pt-14 pb-8">
        {/* Step indicator */}
        <div className="mb-2">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-lg font-bold" style={{ color: "#d4a84c" }}>{currentStep}</span>
            <span className="text-white font-medium text-base">{stepLabel}</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-6 rounded-full"
                style={{
                  background: i < currentStep + (phase === "generating" || phase === "result" ? 1 : 0)
                    ? "linear-gradient(90deg, #d4a84c, #c9a84c)"
                    : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>
        </div>

        {/* SELECT PHASE - center + button with decorative avatars */}
        {(phase === "select" || phase === "actionSheet" || phase === "requirements") && (
          <>
            <div className="flex-1 flex items-center justify-center relative">
              {/* Decorative avatars */}
              {decorativeAvatars.map((a, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-white/10 border border-white/10"
                  style={{
                    top: a.top,
                    left: (a as any).left,
                    right: (a as any).right,
                    width: a.size,
                    height: a.size,
                    filter: `blur(${a.blur}px)`,
                  }}
                />
              ))}

              {/* Center + button */}
              <button
                onClick={() => setPhase("actionSheet")}
                className="w-20 h-20 rounded-full flex items-center justify-center relative"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.1), 0 0 40px rgba(255,255,255,0.05)",
                }}
              >
                <Plus className="w-10 h-10 text-white/70" />
                {/* Orbital rings */}
                <div className="absolute inset-[-20px] rounded-full border border-white/5" />
                <div className="absolute inset-[-40px] rounded-full border border-white/[0.03]" />
              </button>
            </div>

            <div className="text-center mb-4">
              <p className="text-white/60 text-sm">上传照片，生成分身形象</p>
            </div>

            <button
              onClick={() => setPhase("actionSheet")}
              className="w-full h-[52px] rounded-full text-black text-base font-medium active:scale-[0.98] transition-all"
              style={{ background: "linear-gradient(135deg, #c9a84c, #a08633)" }}
            >
              选择图片
            </button>
          </>
        )}

        {/* GENERATING PHASE */}
        {phase === "generating" && (
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Particle ring animation */}
            <div className="relative w-48 h-48 mb-8">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, transparent, rgba(212,168,76,0.3), transparent, rgba(100,200,180,0.2), transparent)",
                  animation: "spin 4s linear infinite",
                }}
              />
              <div className="absolute inset-4 rounded-full bg-black/80" />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-lg font-light tracking-[0.2em] text-white">AI YOU</span>
                <span className="text-xs text-white/50 mt-2">正在创建您的数字分身</span>
              </div>
            </div>

            {/* Progress stages */}
            <div className="w-full space-y-3 mb-6">
              {progressStages.map((stage, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0"
                    style={{
                      borderColor: progress >= stage.threshold ? "#d4a84c" : "rgba(255,255,255,0.2)",
                      background: progress >= stage.threshold ? "rgba(212,168,76,0.15)" : "transparent",
                    }}
                  >
                    {progress >= stage.threshold && <Check className="w-3.5 h-3.5" style={{ color: "#d4a84c" }} />}
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: progress >= stage.threshold ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }}
                  >
                    {stage.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-full">
              <div className="flex justify-between text-xs text-white/50 mb-2">
                <span>加载中</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #d4a84c, #c9a84c)",
                  }}
                />
              </div>
              <p className="text-center text-xs text-white/40 mt-4">
                此头像将代表您的 AI 分身，用于对话与洞察展示。
              </p>
            </div>

            <div className="mt-auto pt-6">
              <button
                onClick={() => {
                  setPhase("select");
                  setProgress(0);
                }}
                className="w-full h-[52px] rounded-full bg-white/10 text-white text-base font-medium active:scale-[0.98] transition-all border border-white/10"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* RESULT PHASE */}
        {phase === "result" && (
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Avatar display */}
            <div className="relative mb-6">
              <div
                className="w-36 h-36 rounded-full overflow-hidden border-2"
                style={{ borderColor: "#d4a84c" }}
              >
                {generatedAvatar ? (
                  <img src={generatedAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-white/10 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-white/30" />
                  </div>
                )}
              </div>
              {/* Decorative orbital rings */}
              <div className="absolute inset-[-12px] rounded-full border border-white/10" />
              <div className="absolute inset-[-24px] rounded-full border border-white/5" />
            </div>

            <h3 className="text-xl font-medium text-white mb-2">
              {user?.user_metadata?.username || "MouMou"}
            </h3>
            <p className="text-white/60 text-sm">您的数字形象已生成</p>

            <div className="w-full mt-auto space-y-3">
              <button
                onClick={handleRegenerate}
                className="w-full h-[52px] rounded-full bg-white/10 text-white text-base font-medium active:scale-[0.98] transition-all border border-white/10"
              >
                重新生成
              </button>
              <button
                onClick={handleConfirm}
                className="w-full h-[52px] rounded-full text-black text-base font-medium active:scale-[0.98] transition-all"
                style={{ background: "linear-gradient(135deg, #c9a84c, #a08633)" }}
              >
                确定
              </button>
              <p className="text-center text-xs text-white/40">
                此头像将代表您的 AI 分身，用于对话与洞察展示。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Sheet overlay */}
      {phase === "actionSheet" && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPhase("select")} />
          <div className="relative w-full bg-neutral-900 rounded-t-3xl p-6 pb-10 space-y-3">
            <button
              onClick={() => setPhase("select")}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="w-full h-[52px] rounded-full bg-white text-black text-base font-medium active:scale-[0.98] transition-all"
            >
              拍照
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-[52px] rounded-full bg-white/15 text-white text-base font-medium active:scale-[0.98] transition-all"
            >
              从相册中选择
            </button>
          </div>
        </div>
      )}

      {/* Requirements overlay */}
      {phase === "requirements" && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPhase("select")} />
          <div className="relative w-full bg-neutral-900 rounded-t-3xl p-6 pb-10">
            <button
              onClick={() => {
                setPhase("select");
                setSelectedImage(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>

            <p className="text-white text-sm leading-relaxed mb-5 pr-8">
              请添加一张清晰的正脸照片，以便 AI 生成更具辨识度且专业的虚拟形象。
            </p>

            {/* Photo requirement examples */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: "单人正面", ok: true },
                { label: "面部清晰可见", ok: true },
                { label: "人像太小", ok: false },
                { label: "脸部遮挡", ok: false },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="w-full aspect-square rounded-lg bg-white/10 flex items-center justify-center relative overflow-hidden">
                    <ImageIcon className="w-8 h-8 text-white/20" />
                    <div
                      className="absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: item.ok ? "#d4a84c" : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {item.ok ? (
                        <Check className="w-3 h-3 text-black" />
                      ) : (
                        <X className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-white/60">{item.label}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleUploadAndGenerate}
              className="w-full h-[52px] rounded-full bg-white/15 text-white text-base font-medium active:scale-[0.98] transition-all"
            >
              立即选择
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
