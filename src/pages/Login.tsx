import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapPin, Loader2 } from "lucide-react";
import { signIn, signUp } from "@/services/auth";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/";
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authLoading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const u = await signIn(email, senha);
      toast.success(`Bem-vindo, ${u.nome}`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  async function onSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (senha.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, senha, nome || email.split("@")[0]);
      toast.success("Conta criada! Entrando...");
      // como auto-confirm está ligado, signUp já cria sessão
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no cadastro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display font-bold text-xl leading-none">GeoSIGEF</div>
            <div className="text-[11px] text-muted-foreground">Manager</div>
          </div>
        </div>

        <Card className="p-6">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as "login" | "signup"); setError(null); }}>
            <TabsList className="grid grid-cols-2 w-full mb-5">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={onLogin} className="space-y-4">
                <Field label="E-mail">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="seu@email.com" />
                </Field>
                <Field label="Senha">
                  <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required autoComplete="current-password" />
                </Field>
                {error && <ErrorBox msg={error} />}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Entrando...</>) : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={onSignup} className="space-y-4">
                <Field label="Nome">
                  <Input value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Seu nome completo" />
                </Field>
                <Field label="E-mail">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </Field>
                <Field label="Senha">
                  <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required autoComplete="new-password" minLength={6} />
                </Field>
                {error && <ErrorBox msg={error} />}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando...</>) : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground mt-4">
          Sistema interno · GeoSIGEF Manager
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
function ErrorBox({ msg }: { msg: string }) {
  return <div className="text-xs text-destructive bg-destructive/5 border border-destructive/30 rounded p-2">{msg}</div>;
}
