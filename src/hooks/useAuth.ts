import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { AuthUser } from "@/services/auth";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener PRIMEIRO, depois getSession (recomendado pelo Supabase)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email || "",
        nome:
          (session.user.user_metadata?.nome as string) ||
          (session.user.email ? session.user.email.split("@")[0] : "Usuário"),
      }
    : null;

  return { session, user, loading, isAuthenticated: !!session };
}
