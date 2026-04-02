
-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1. profiles
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
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', NEW.email), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. admin_users
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

-- 3. roles
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

-- 4. agents
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

-- 5. conversations
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

-- 6. notes
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

-- 7. token_prices
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

-- 8. plans
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

-- 9. orders
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

-- 10. usage_records
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

-- 11. memory_configs
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

-- ===== RLS Policies =====

-- profiles: users see own, admins see all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can delete profiles" ON public.profiles FOR DELETE USING (public.is_admin());

-- admin_users: only admins
CREATE POLICY "Admins can view admin_users" ON public.admin_users FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert admin_users" ON public.admin_users FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update admin_users" ON public.admin_users FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete admin_users" ON public.admin_users FOR DELETE USING (public.is_admin());

-- roles: only admins
CREATE POLICY "Admins can view roles" ON public.roles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert roles" ON public.roles FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update roles" ON public.roles FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete roles" ON public.roles FOR DELETE USING (public.is_admin());

-- agents: only admins
CREATE POLICY "Admins can view agents" ON public.agents FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert agents" ON public.agents FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update agents" ON public.agents FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete agents" ON public.agents FOR DELETE USING (public.is_admin());

-- conversations: only admins
CREATE POLICY "Admins can view conversations" ON public.conversations FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update conversations" ON public.conversations FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete conversations" ON public.conversations FOR DELETE USING (public.is_admin());

-- notes: only admins
CREATE POLICY "Admins can view notes" ON public.notes FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update notes" ON public.notes FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete notes" ON public.notes FOR DELETE USING (public.is_admin());

-- token_prices: only admins
CREATE POLICY "Admins can view token_prices" ON public.token_prices FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert token_prices" ON public.token_prices FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update token_prices" ON public.token_prices FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete token_prices" ON public.token_prices FOR DELETE USING (public.is_admin());

-- plans: only admins
CREATE POLICY "Admins can view plans" ON public.plans FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert plans" ON public.plans FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update plans" ON public.plans FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete plans" ON public.plans FOR DELETE USING (public.is_admin());

-- orders: only admins
CREATE POLICY "Admins can view orders" ON public.orders FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert orders" ON public.orders FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE USING (public.is_admin());

-- usage_records: only admins
CREATE POLICY "Admins can view usage_records" ON public.usage_records FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert usage_records" ON public.usage_records FOR INSERT WITH CHECK (public.is_admin());

-- memory_configs: only admins
CREATE POLICY "Admins can view memory_configs" ON public.memory_configs FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert memory_configs" ON public.memory_configs FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update memory_configs" ON public.memory_configs FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete memory_configs" ON public.memory_configs FOR DELETE USING (public.is_admin());

-- Dashboard aggregation RPC
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
