import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  email: string;
  nome: string;
}

function toAuthUser(u: User | null | undefined): AuthUser | null {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email || "",
    nome: (u.user_metadata?.nome as string) || (u.email ? u.email.split("@")[0] : "Usuário"),
  };
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data } = await supabase.auth.getUser();
  return toAuthUser(data.user);
}

export async function signIn(email: string, senha: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) throw new Error(traduzirErroAuth(error.message));
  return toAuthUser(data.user)!;
}

export async function signUp(email: string, senha: string, nome: string): Promise<AuthUser> {
  const redirectTo = `${window.location.origin}/`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: { data: { nome }, emailRedirectTo: redirectTo },
  });
  if (error) throw new Error(traduzirErroAuth(error.message));
  return toAuthUser(data.user)!;
}

export async function signOut() {
  await supabase.auth.signOut();
}

function traduzirErroAuth(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("already registered") || m.includes("already exists")) return "E-mail já cadastrado.";
  if (m.includes("password") && m.includes("6")) return "A senha deve ter ao menos 6 caracteres.";
  if (m.includes("email")) return "E-mail inválido.";
  return msg;
}
