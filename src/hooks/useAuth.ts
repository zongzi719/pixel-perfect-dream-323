import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (phone: string, password: string) => {
    // Try user email first, then admin email
    const userEmail = `${phone}@user.aiyou.com`;
    const { error: userErr } = await supabase.auth.signInWithPassword({ email: userEmail, password });
    if (!userErr) return;
    
    const adminEmail = `${phone}@admin.com`;
    const { error: adminErr } = await supabase.auth.signInWithPassword({ email: adminEmail, password });
    if (adminErr) throw adminErr;
  }, []);

  const signUp = useCallback(async (phone: string, password: string) => {
    const email = `${phone}@user.aiyou.com`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { phone, username: phone } },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { session, user, loading, signIn, signUp, signOut };
}
