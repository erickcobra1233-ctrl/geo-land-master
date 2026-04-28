import { Bell, Search, Plus, HelpCircle, MapPin, Layers, User2, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useGeoStore } from "@/store/useGeoStore";
import { useNavigate } from "react-router-dom";
import { useImoveis } from "@/hooks/useImoveis";
import { useClientes } from "@/hooks/useClientes";
import { ImovelFormDialog } from "@/components/forms/ImovelFormDialog";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/services/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [novoImovelOpen, setNovoImovelOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { pontos } = useGeoStore();
  const { data: imoveis = [] } = useImoveis();
  const { data: clientes = [] } = useClientes();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Atalho ⌘K / Ctrl+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const ql = q.trim().toLowerCase();
  const results = ql.length > 1
    ? {
        imoveis: imoveis.filter(
          (i) =>
            i.nome.toLowerCase().includes(ql) ||
            i.matricula.toLowerCase().includes(ql) ||
            i.codigoIncra.toLowerCase().includes(ql) ||
            i.proprietarioNome.toLowerCase().includes(ql) ||
            i.municipio.toLowerCase().includes(ql) ||
            i.responsavelTecnico.toLowerCase().includes(ql) ||
            i.confrontantes.some((c) => c.nome.toLowerCase().includes(ql))
        ).slice(0, 5),
        pontos: pontos.filter((p) =>
          p.codigo.toLowerCase().includes(ql) ||
          p.nome.toLowerCase().includes(ql) ||
          p.municipio.toLowerCase().includes(ql)
        ).slice(0, 4),
        clientes: clientes.filter((c) =>
          c.nome.toLowerCase().includes(ql) || c.cpfCnpj.includes(ql)
        ).slice(0, 3),
      }
    : null;

  const totalResults = results ? results.imoveis.length + results.pontos.length + results.clientes.length : 0;

  return (
    <header className="h-16 shrink-0 bg-card border-b border-border px-6 flex items-center gap-4">
      {/* Busca global */}
      <div className="relative flex-1 max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          placeholder="Buscar imóvel, matrícula, proprietário, código de ponto, responsável técnico..."
          className="pl-10 pr-20 h-10 bg-background border-border"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
          ⌘K
        </kbd>

        {open && (
          <div className="absolute top-12 left-0 right-0 bg-popover border border-border rounded-lg shadow-pop overflow-hidden z-50 animate-fade-in max-h-[70vh] overflow-y-auto">
            {ql.length <= 1 ? (
              <div className="p-4 text-xs text-muted-foreground">
                Digite ao menos 2 caracteres. Busca por nome, matrícula, código INCRA, proprietário, código de ponto ou responsável técnico.
              </div>
            ) : totalResults === 0 ? (
              <div className="p-4 text-xs text-muted-foreground">Nenhum resultado para “{q}”.</div>
            ) : (
              <>
                {results!.imoveis.length > 0 && (
                  <Section icon={Layers} title="Imóveis" count={results!.imoveis.length}>
                    {results!.imoveis.map((i) => (
                      <ResultRow
                        key={i.id}
                        onClick={() => { navigate(`/imoveis/${i.id}`); setOpen(false); setQ(""); }}
                        title={i.nome}
                        subtitle={`Matr. ${i.matricula} · ${i.municipio}/${i.estado} · ${i.responsavelTecnico.replace("Eng. ", "")}`}
                        right={`${i.areaHa.toFixed(0)} ha`}
                      />
                    ))}
                  </Section>
                )}
                {results!.pontos.length > 0 && (
                  <Section icon={MapPin} title="Pontos & Vértices" count={results!.pontos.length}>
                    {results!.pontos.map((p) => (
                      <ResultRow
                        key={p.id}
                        onClick={() => { navigate(`/pontos`); setOpen(false); setQ(""); }}
                        title={p.codigo}
                        mono
                        subtitle={`${p.tipo} · ${p.municipio} · ${p.equipamento}`}
                        right={p.imovelId ? "vinculado" : "avulso"}
                      />
                    ))}
                  </Section>
                )}
                {results!.clientes.length > 0 && (
                  <Section icon={User2} title="Clientes" count={results!.clientes.length}>
                    {results!.clientes.map((c) => (
                      <ResultRow
                        key={c.id}
                        onClick={() => { navigate(`/clientes`); setOpen(false); setQ(""); }}
                        title={c.nome}
                        subtitle={`${c.cpfCnpj} · ${c.municipio}/${c.estado}`}
                      />
                    ))}
                  </Section>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" className="text-muted-foreground" title="Ajuda">
          <HelpCircle className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground" title="Notificações">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setNovoImovelOpen(true)}>
          <Plus className="w-4 h-4" /> Novo Imóvel
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground" title="Conta">
              <User2 className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-xs">{user?.nome || "Usuário"}</div>
              <div className="text-[10px] font-normal text-muted-foreground truncate">
                {user?.email || "—"}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await signOut();
                navigate("/login", { replace: true });
              }}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ImovelFormDialog open={novoImovelOpen} onOpenChange={setNovoImovelOpen} />
    </header>
  );
}

function Section({ icon: Icon, title, count, children }: { icon: any; title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <div className="px-3 py-1.5 flex items-center gap-2 bg-muted/40">
        <Icon className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{title}</span>
        <span className="text-[10px] text-muted-foreground font-mono ml-auto">{count}</span>
      </div>
      <div className="p-1">{children}</div>
    </div>
  );
}

function ResultRow({ onClick, title, subtitle, right, mono }: { onClick: () => void; title: string; subtitle: string; right?: string; mono?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-2.5 py-2 rounded hover:bg-muted text-sm flex items-center justify-between gap-3"
    >
      <div className="min-w-0 flex-1">
        <div className={`font-medium truncate ${mono ? "font-mono text-xs text-primary" : ""}`}>{title}</div>
        <div className="text-[11px] text-muted-foreground truncate">{subtitle}</div>
      </div>
      {right && <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">{right}</span>}
    </button>
  );
}
