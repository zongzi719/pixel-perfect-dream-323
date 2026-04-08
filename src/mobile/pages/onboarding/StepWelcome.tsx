import mobileBg from "@/assets/mobile-bg.jpg";

interface StepWelcomeProps {
  onStart: () => void;
}

export default function StepWelcome({ onStart }: StepWelcomeProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden">
      {/* Background */}
      <img
        src={mobileBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 px-8">
        {/* Brand area */}
        <div className="flex flex-col pt-[25vh]">
          <h1
            className="text-3xl font-light tracking-[0.3em]"
            style={{ color: "#d4b966", textShadow: "0 0 30px rgba(212,185,102,0.3)" }}
          >
            AI YOU
          </h1>

          <h2 className="text-[32px] font-bold text-white leading-tight mt-10">
            开始构建AI
            <br />
            BOSS模型
          </h2>

          <p className="text-white/60 text-base mt-4">
            从今天起，拥有另一个自己
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Start button */}
        <div className="pb-10">
          <button
            onClick={onStart}
            className="w-full h-[52px] rounded-full text-black text-base font-medium active:scale-[0.98] transition-all"
            style={{
              background: "linear-gradient(135deg, #c9a84c, #a08633)",
            }}
          >
            开始
          </button>
        </div>
      </div>
    </div>
  );
}
