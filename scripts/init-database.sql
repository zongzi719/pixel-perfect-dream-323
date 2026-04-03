-- ============================================================
-- AIYOU 项目 - 合并数据库初始化 SQL
-- 由 6 个迁移文件合并而成，适用于本地 Supabase 或独立 PostgreSQL
-- 生成时间：2026-04-03
-- ============================================================

-- ===== 基础函数 =====

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ===== 1. profiles =====

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned')),
  token_used INTEGER NOT NULL DEFAULT 0,
  token_balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== 2. admin_users =====

CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '运营',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- is_admin security definer function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = auth.uid() AND status = 'active'
  )
$$;

-- ===== 3. roles =====

CREATE TABLE public.roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== 4. agents =====

CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  perspective TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  system_prompt TEXT DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== 5. conversations =====

CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  agent_name TEXT DEFAULT '',
  username TEXT DEFAULT '',
  message_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'flagged', 'deleted')),
  last_message TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== 6. messages =====

CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL DEFAULT '',
  coach_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ===== 7. notes =====

CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  username TEXT DEFAULT '',
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'flagged', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== 8. token_prices =====

CREATE TABLE public.token_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  model TEXT NOT NULL,
  input_price NUMERIC(10,4) NOT NULL DEFAULT 0,
  output_price NUMERIC(10,4) NOT NULL DEFAULT 0,
  unit TEXT DEFAULT '元/千Token',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.token_prices ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_token_prices_updated_at BEFORE UPDATE ON public.token_prices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== 9. plans =====

CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'payg')),
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  tokens INTEGER NOT NULL DEFAULT 0,
  duration TEXT DEFAULT '月',
  features TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  subscribers INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== 10. orders =====

CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  username TEXT DEFAULT '',
  plan_name TEXT DEFAULT '',
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'refunded')),
  pay_method TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ===== 11. usage_records =====

CREATE TABLE public.usage_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  username TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT '文本',
  agent_name TEXT DEFAULT '',
  tokens_input INTEGER NOT NULL DEFAULT 0,
  tokens_output INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC(10,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- ===== 12. memory_configs =====

CREATE TABLE public.memory_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  username TEXT DEFAULT '',
  memory_count INTEGER NOT NULL DEFAULT 0,
  max_memory INTEGER NOT NULL DEFAULT 100,
  retention_days INTEGER NOT NULL DEFAULT 90,
  auto_extract BOOLEAN NOT NULL DEFAULT true,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.memory_configs ENABLE ROW LEVEL SECURITY;

-- ===== 13. knowledge_folders =====

CREATE TABLE public.knowledge_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_folders ENABLE ROW LEVEL SECURITY;

-- ===== 14. knowledge_files =====

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

-- ===== 15. meetings =====

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

-- ===== 16. llm_models =====

CREATE TABLE public.llm_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'OpenAI',
  provider_type TEXT NOT NULL DEFAULT 'openai_compatible',
  base_url TEXT NOT NULL DEFAULT 'https://api.openai.com/v1',
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
CREATE TRIGGER update_llm_models_updated_at BEFORE UPDATE ON public.llm_models FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== RLS Policies =====

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (public.is_admin());

-- admin_users
CREATE POLICY "Admins can view admin_users" ON public.admin_users FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert admin_users" ON public.admin_users FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update admin_users" ON public.admin_users FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete admin_users" ON public.admin_users FOR DELETE USING (public.is_admin());

-- roles
CREATE POLICY "Admins can view roles" ON public.roles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert roles" ON public.roles FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update roles" ON public.roles FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete roles" ON public.roles FOR DELETE USING (public.is_admin());

-- agents
CREATE POLICY "Admins can view agents" ON public.agents FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert agents" ON public.agents FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update agents" ON public.agents FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete agents" ON public.agents FOR DELETE USING (public.is_admin());
CREATE POLICY "Authenticated users can view agents" ON public.agents FOR SELECT TO authenticated USING (true);

-- conversations
CREATE POLICY "Admins can view conversations" ON public.conversations FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update conversations" ON public.conversations FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete conversations" ON public.conversations FOR DELETE USING (public.is_admin());
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own conversations" ON public.conversations FOR DELETE TO authenticated USING (user_id = auth.uid());

-- messages
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));
CREATE POLICY "Users can insert own messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));
CREATE POLICY "Users can delete own messages" ON public.messages FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid()));
CREATE POLICY "Admins can view all messages" ON public.messages FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can delete messages" ON public.messages FOR DELETE USING (public.is_admin());

-- notes
CREATE POLICY "Users can view own notes" ON public.notes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own notes" ON public.notes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own notes" ON public.notes FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view notes" ON public.notes FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update notes" ON public.notes FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete notes" ON public.notes FOR DELETE USING (public.is_admin());

-- token_prices
CREATE POLICY "Admins can view token_prices" ON public.token_prices FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert token_prices" ON public.token_prices FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update token_prices" ON public.token_prices FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete token_prices" ON public.token_prices FOR DELETE USING (public.is_admin());

-- plans
CREATE POLICY "Admins can view plans" ON public.plans FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert plans" ON public.plans FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update plans" ON public.plans FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete plans" ON public.plans FOR DELETE USING (public.is_admin());

-- orders
CREATE POLICY "Admins can view orders" ON public.orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert orders" ON public.orders FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE USING (public.is_admin());

-- usage_records
CREATE POLICY "Admins can view usage_records" ON public.usage_records FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert usage_records" ON public.usage_records FOR INSERT WITH CHECK (public.is_admin());

-- memory_configs
CREATE POLICY "Admins can view memory_configs" ON public.memory_configs FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert memory_configs" ON public.memory_configs FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update memory_configs" ON public.memory_configs FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete memory_configs" ON public.memory_configs FOR DELETE USING (public.is_admin());

-- knowledge_folders
CREATE POLICY "Users can view own folders" ON public.knowledge_folders FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own folders" ON public.knowledge_folders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own folders" ON public.knowledge_folders FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own folders" ON public.knowledge_folders FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage folders" ON public.knowledge_folders FOR ALL USING (public.is_admin());

-- knowledge_files
CREATE POLICY "Users can view own files" ON public.knowledge_files FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own files" ON public.knowledge_files FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own files" ON public.knowledge_files FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own files" ON public.knowledge_files FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage files" ON public.knowledge_files FOR ALL USING (public.is_admin());

-- meetings
CREATE POLICY "Users can view own meetings" ON public.meetings FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own meetings" ON public.meetings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own meetings" ON public.meetings FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own meetings" ON public.meetings FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage meetings" ON public.meetings FOR ALL USING (public.is_admin());

-- llm_models
CREATE POLICY "Admins can manage llm_models" ON public.llm_models FOR ALL USING (public.is_admin());
CREATE POLICY "Users can view enabled models" ON public.llm_models FOR SELECT TO authenticated USING (enabled = true);

-- ===== Dashboard RPC =====

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT json_build_object(
    'totalUsers', (SELECT count(*) FROM public.profiles),
    'activeUsers', (SELECT count(*) FROM public.profiles WHERE status = 'active'),
    'totalTokens', (SELECT COALESCE(sum(token_used), 0) FROM public.profiles),
    'revenue', (SELECT COALESCE(sum(amount), 0) FROM public.orders WHERE status = 'paid')
  ) INTO result;
  RETURN result;
END;
$$;

-- ===== Storage =====

INSERT INTO storage.buckets (id, name, public) VALUES ('knowledge', 'knowledge', true);
CREATE POLICY "Users can upload knowledge files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'knowledge' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own knowledge files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'knowledge' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own knowledge files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'knowledge' AND (storage.foldername(name))[1] = auth.uid()::text);
