import { useState, useRef, useEffect } from "react";
import { Mic, Pause, RotateCcw, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mobileBg from "@/assets/mobile-bg.jpg";

interface StepVoiceProps {
  onComplete: (url: string) => void;
  onSkip: () => void;
}

const READING_TEXT = `"Hello，我来了。

只要我持续完善我的分身，它就会越来越像我。
这一段声音，就是另一个我的起点。

我的声音里，藏着我的思考方式、我的判断习惯、我的表达节奏。

录下来，它就能学会。

以后，它就能替我思考，替我推演，替我看见我看不见的东西。"`;

export default function StepVoice({ onComplete, onSkip }: StepVoiceProps) {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m} : ${sec}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("无法访问麦克风，请检查权限设置");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setSeconds(0);
    startRecording();
  };

  const confirmRecording = async () => {
    if (!audioBlob || !user) return;
    try {
      const path = `${user.id}/voice_${Date.now()}.webm`;
      const { error } = await supabase.storage
        .from("ai-boss")
        .upload(path, audioBlob);
      if (error) throw error;

      const { data } = supabase.storage.from("ai-boss").getPublicUrl(path);
      onComplete(data.publicUrl || path);
    } catch {
      toast.error("上传失败，请重试");
    }
  };

  const totalSteps = 4;
  const currentStep = 1;

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden">
      <img
        src={mobileBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      <div className="relative z-10 flex flex-col flex-1 px-6 pt-14 pb-8">
        {/* Step indicator */}
        <div className="mb-2">
          <div className="flex items-center gap-1.5 mb-2">
            <span
              className="text-lg font-bold"
              style={{ color: "#d4a84c" }}
            >
              {currentStep}
            </span>
            <span className="text-white font-medium text-base">声音采集</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-6 rounded-full"
                style={{
                  background:
                    i < currentStep
                      ? "linear-gradient(90deg, #d4a84c, #c9a84c)"
                      : "rgba(255,255,255,0.15)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Motivational text */}
        <div className="mt-6 mb-4">
          <h2 className="text-[22px] font-bold text-white leading-relaxed">
            你每一次说话
            <br />
            都在让另一个你变得更聪明。
          </h2>
        </div>

        {/* Instruction */}
        <div className="mb-3">
          <p className="text-white/80 text-sm">请用自然语气请朗读以下内容：</p>
          <p className="text-white/50 text-xs mt-0.5">找一个安静的环境</p>
        </div>

        {/* Reading card */}
        <div className="flex-1 overflow-auto">
          <div className="bg-white/5 rounded-2xl p-5 backdrop-blur-sm border border-white/5">
            <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">
              {READING_TEXT}
            </p>
          </div>
        </div>

        {/* Recording controls */}
        <div className="flex flex-col items-center mt-6">
          {!isRecording && !audioBlob && (
            <button
              onClick={startRecording}
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center relative"
              style={{
                background:
                  "radial-gradient(circle, rgba(60,60,60,0.9) 0%, rgba(30,30,30,0.95) 100%)",
                boxShadow:
                  "0 0 0 3px rgba(212,168,76,0.3), 0 0 20px rgba(212,168,76,0.15)",
              }}
            >
              <Mic className="w-7 h-7 text-white/90" />
            </button>
          )}

          {isRecording && (
            <>
              <p
                className="text-sm mb-4 tracking-widest"
                style={{ color: "#d4a84c" }}
              >
                {formatTime(seconds)}
              </p>
              <div className="flex items-center gap-12">
                <button
                  onClick={() => {
                    stopRecording();
                    resetRecording();
                  }}
                  className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <RotateCcw className="w-5 h-5 text-white/70" />
                </button>
                <button
                  onClick={stopRecording}
                  className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(60,60,60,0.9) 0%, rgba(30,30,30,0.95) 100%)",
                    boxShadow:
                      "0 0 0 3px rgba(212,168,76,0.4), 0 0 25px rgba(212,168,76,0.2)",
                  }}
                >
                  <Pause className="w-7 h-7 text-white/90" />
                </button>
                <button
                  onClick={() => {
                    stopRecording();
                    // Will trigger onstop -> setAudioBlob
                    setTimeout(confirmRecording, 300);
                  }}
                  className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <Check className="w-5 h-5 text-white/70" />
                </button>
              </div>
            </>
          )}

          {!isRecording && audioBlob && (
            <>
              <p
                className="text-sm mb-4 tracking-widest"
                style={{ color: "#d4a84c" }}
              >
                {formatTime(seconds)}
              </p>
              <div className="flex items-center gap-12">
                <button
                  onClick={resetRecording}
                  className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <RotateCcw className="w-5 h-5 text-white/70" />
                </button>
                <button
                  onClick={startRecording}
                  className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(60,60,60,0.9) 0%, rgba(30,30,30,0.95) 100%)",
                    boxShadow:
                      "0 0 0 3px rgba(212,168,76,0.3), 0 0 20px rgba(212,168,76,0.15)",
                  }}
                >
                  <Mic className="w-7 h-7 text-white/90" />
                </button>
                <button
                  onClick={confirmRecording}
                  className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <Check className="w-5 h-5 text-white/70" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
