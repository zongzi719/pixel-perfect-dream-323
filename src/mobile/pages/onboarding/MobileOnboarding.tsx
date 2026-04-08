import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StepWelcome from "./StepWelcome";
import StepVoice from "./StepVoice";
import StepImage from "./StepImage";

export default function MobileOnboarding() {
  const [step, setStep] = useState(0);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleVoiceComplete = (url: string) => {
    setVoiceUrl(url);
    setStep(2);
  };

  const handleImageComplete = async (generatedUrl: string) => {
    setAvatarUrl(generatedUrl);
    if (!user) return;

    try {
      // Save AI BOSS data
      await supabase.from("user_ai_boss" as any).upsert({
        user_id: user.id,
        voice_recording_url: voiceUrl,
        avatar_generated_url: generatedUrl,
        status: "completed",
      } as any);

      // Mark onboarding as completed
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true } as any)
        .eq("user_id", user.id);

      toast.success("AI BOSS 模型构建完成！");
      navigate("/m/chat", { replace: true });
    } catch (e: any) {
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
    </div>
  );
}
