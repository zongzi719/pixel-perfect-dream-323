
-- Add onboarding_completed to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Create user_ai_boss table
CREATE TABLE public.user_ai_boss (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_recording_url text,
  avatar_source_url text,
  avatar_generated_url text,
  interview_data jsonb,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_ai_boss ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ai_boss" ON public.user_ai_boss FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own ai_boss" ON public.user_ai_boss FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own ai_boss" ON public.user_ai_boss FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage ai_boss" ON public.user_ai_boss FOR ALL USING (public.is_admin());

-- Create ai-boss storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('ai-boss', 'ai-boss', false);

CREATE POLICY "Users can upload ai-boss files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ai-boss' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own ai-boss files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'ai-boss' AND (storage.foldername(name))[1] = auth.uid()::text);
