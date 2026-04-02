
-- Knowledge folders table
CREATE TABLE public.knowledge_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own folders" ON public.knowledge_folders FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own folders" ON public.knowledge_folders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own folders" ON public.knowledge_folders FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own folders" ON public.knowledge_folders FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage folders" ON public.knowledge_folders FOR ALL USING (public.is_admin());

-- Knowledge files table
CREATE TABLE public.knowledge_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_id UUID REFERENCES public.knowledge_folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'pdf',
  status TEXT NOT NULL DEFAULT 'summary_ready',
  status_label TEXT NOT NULL DEFAULT 'Summary ready',
  size TEXT,
  storage_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own files" ON public.knowledge_files FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own files" ON public.knowledge_files FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own files" ON public.knowledge_files FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own files" ON public.knowledge_files FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage files" ON public.knowledge_files FOR ALL USING (public.is_admin());

-- Meetings table
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  duration TEXT NOT NULL DEFAULT '',
  participants INTEGER NOT NULL DEFAULT 0,
  folder TEXT NOT NULL DEFAULT 'all',
  audio_url TEXT,
  audio_duration TEXT,
  transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own meetings" ON public.meetings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own meetings" ON public.meetings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own meetings" ON public.meetings FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own meetings" ON public.meetings FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage meetings" ON public.meetings FOR ALL USING (public.is_admin());

-- Storage bucket for knowledge files
INSERT INTO storage.buckets (id, name, public) VALUES ('knowledge', 'knowledge', true);
CREATE POLICY "Users can upload knowledge files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'knowledge' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own knowledge files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'knowledge' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own knowledge files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'knowledge' AND (storage.foldername(name))[1] = auth.uid()::text);
