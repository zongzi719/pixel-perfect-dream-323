import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StepWelcome from "./StepWelcome";
import StepVoice from "./StepVoice";
import StepImage from "./StepImage";
import StepInterview from "./StepInterview";
import StepComplete from "./StepComplete";
import StepProfile from "./StepProfile";

export default function MobileOnboarding() {
  const [step, setStep] = useState(0);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [interviewData, setInterviewData] = useState<any>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleVoiceComplete = (url: string) => {
    setVoiceUrl(url);
    setStep(2);
  };

  const handleImageComplete = (generatedUrl: string) => {
    setAvatarUrl(generatedUrl);
    setStep(3);
  };

  const handleInterviewComplete = async (data: any) => {
    setInterviewData(data);
    // Save interview data
    if (user) {
      try {
        await supabase.from("user_ai_boss" as any).upsert({
          user_id: user.id,
          voice_recording_url: voiceUrl,
          avatar_generated_url: avatarUrl,
          interview_data: data,
          status: "interview_completed",
        } as any);
      } catch {}
    }
    setStep(4);
  };

  const handleProfileComplete = async () => {
    if (!user) return;
    try {
      await supabase.from("user_ai_boss" as any).upsert({
        user_id: user.id,
        voice_recording_url: voiceUrl,
        avatar_generated_url: avatarUrl,
        interview_data: interviewData,
        status: "completed",
      } as any);

      await supabase
        .from("profiles")
        .update({ onboarding_completed: true } as any)
        .eq("user_id", user.id);

      toast.success("AI BOSS 模型构建完成！");
      navigate("/m/chat", { replace: true });
    } catch {
      toast.error("保存失败，请重试");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black">
      {step === 0 && <StepWelcome onStart={() => setStep(1)} />}
      {step === 1 && (
        <StepVoice onComplete={handleVoiceComplete} onSkip={() => setStep(2)} />
      )}
      {step === 2 && <StepImage onComplete={handleImageComplete} />}
      {step === 3 && <StepInterview onComplete={handleInterviewComplete} />}
      {step === 4 && <StepComplete onNext={() => setStep(5)} />}
      {step === 5 && <StepProfile avatarUrl={avatarUrl} onComplete={handleProfileComplete} />}
    </div>
  );
}
