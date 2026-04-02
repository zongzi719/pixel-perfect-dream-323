
-- 1. Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL DEFAULT '',
  coach_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 2. RLS for messages: users access via conversation ownership
CREATE POLICY "Users can view own messages" ON public.messages
FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid())
);
CREATE POLICY "Users can insert own messages" ON public.messages
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.conversations WHERE conversations.id = messages.conversation_id AND conversations.user_id = auth.uid())
);
CREATE POLICY "Admins can view all messages" ON public.messages
FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can delete messages" ON public.messages
FOR DELETE USING (public.is_admin());

-- 3. RLS for conversations: users can insert and select own
CREATE POLICY "Users can view own conversations" ON public.conversations
FOR SELECT TO authenticated
USING (user_id = auth.uid());
CREATE POLICY "Users can insert own conversations" ON public.conversations
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own conversations" ON public.conversations
FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- 4. RLS for notes: users CRUD own
CREATE POLICY "Users can view own notes" ON public.notes
FOR SELECT TO authenticated
USING (user_id = auth.uid());
CREATE POLICY "Users can insert own notes" ON public.notes
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own notes" ON public.notes
FOR UPDATE TO authenticated
USING (user_id = auth.uid());
CREATE POLICY "Users can delete own notes" ON public.notes
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 5. Allow all authenticated users to view agents
CREATE POLICY "Authenticated users can view agents" ON public.agents
FOR SELECT TO authenticated
USING (true);

-- 6. Update handle_new_user to extract phone
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

-- 7. Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
