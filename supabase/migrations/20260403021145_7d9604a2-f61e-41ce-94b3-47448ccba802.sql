
CREATE TABLE public.llm_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'OpenAI',
  base_url TEXT NOT NULL DEFAULT 'https://ai.gateway.lovable.dev/v1',
  api_key TEXT,
  input_price NUMERIC NOT NULL DEFAULT 1,
  output_price NUMERIC NOT NULL DEFAULT 2,
  context_window INTEGER NOT NULL DEFAULT 128000,
  enabled BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.llm_models ENABLE ROW LEVEL SECURITY;

-- Admins full CRUD
CREATE POLICY "Admins can manage llm_models" ON public.llm_models FOR ALL USING (public.is_admin());

-- Authenticated users can view enabled models
CREATE POLICY "Users can view enabled models" ON public.llm_models FOR SELECT TO authenticated USING (enabled = true);

-- Auto-update updated_at
CREATE TRIGGER update_llm_models_updated_at
  BEFORE UPDATE ON public.llm_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default model
INSERT INTO public.llm_models (model_name, display_name, provider, base_url, is_default, tags, sort_order)
VALUES ('google/gemini-3-flash-preview', 'Gemini 3 Flash', 'Google', 'https://ai.gateway.lovable.dev/v1', true, '{"默认"}', 0);
