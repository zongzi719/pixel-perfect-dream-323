import mobileBg from "@/assets/mobile-bg.jpg";

interface StepCompleteProps {
  onNext: () => void;
}

export default function StepComplete({ onNext }: StepCompleteProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden">
      <img src={mobileBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      <div className="relative z-10 flex flex-col flex-1 px-8">
        {/* Step indicator */}
        <div className="pt-16 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-amber-400 text-lg font-bold">❹</span>
            <span className="text-white text-lg font-medium">AI解析完成</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-1 flex-1 rounded-full bg-amber-400" />
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          {/* Celebration icon */}
          <div className="w-24 h-24 rounded-full mb-8 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))", border: "2px solid rgba(201,168,76,0.3)" }}>
            <span className="text-5xl">🎉</span>
          </div>

          <h1 className="text-[36px] font-bold text-white mb-6">恭喜你！</h1>

          <p className="text-white/60 text-base leading-relaxed max-w-[280px]">
            已完成初次见面沟通，接下来将根据你上传的所有数据生成老板数字记忆模型。
          </p>
        </div>

        {/* Button */}
        <div className="pb-10">
          <button
            onClick={onNext}
            className="w-full h-[52px] rounded-full text-black text-base font-medium active:scale-[0.98] transition-all"
            style={{ background: "linear-gradient(135deg, #c9a84c, #a08633)" }}
          >
            开始
          </button>
        </div>
      </div>
    </div>
  );
}
