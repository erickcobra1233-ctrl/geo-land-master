import { Bell, Search, Plus, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useGeoStore } from "@/store/useGeoStore";
import { useNavigate } from "react-router-dom";

export function Topbar() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const { imoveis, pontos, clientes } = useGeoStore();
  const navigate = useNavigate();

  const results = q.trim().length > 1
    ? {
        imoveis: imoveis.filter(
          (i) =>
            i.nome.toLowerCase().includes(q.toLowerCase()) ||
            i.matricula.includes(q) ||
            i.proprietarioNome.toLowerCase().includes(q.toLowerCase()) ||
            i.municipio.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 4),
        pontos: pontos.filter((p) =>
          p.codigo.toLowerCase().includes(q.toLowerCase()) || p.nome.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 3),
        clientes: clientes.filter((c) => c.nome.toLowerCase().includes(q.toLowerCase())).slice(0, 3),
      }
    : null;

  return (
    <header className="h-16 shrink-0 bg-card border-b border-border px-6 flex items-center gap-4">
      {/* Busca global */}
      <div className="relative flex-1 max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Buscar imóvel, matrícula, proprietário, código de ponto, município..."
          className="pl-10 pr-20 h-10 bg-background border-border"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
          ⌘K
        </kbd>
        {open && results && (results.imoveis.length + results.pontos.length + results.clientes.length > 0) && (
          <div className="absolute top-12 left-0 right-0 bg-popover border border-border rounded-lg shadow-pop overflow-hidden z-50 animate-fade-in">
            {results.imoveis.length > 0 && (
              <div className="p-2">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 pb-1">Imóveis</div>
                {results.imoveis.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => { navigate(`/imoveis/${i.id}`); setOpen(false); setQ(""); }}
                    className="w-full text-left px-2 py-2 rounded hover:bg-muted text-sm flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{i.nome}</div>
                      <div className="text-xs text-muted-foreground">Matr. {i.matricula} · {i.municipio}/{i.estado}</div>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">{i.areaHa.toFixed(2)} ha</span>
                  </button>
                ))}
              </div>
            )}
            {results.pontos.length > 0 && (
              <div className="p-2 border-t border-border">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 pb-1">Pontos</div>
                {results.pontos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { navigate(`/pontos`); setOpen(false); setQ(""); }}
                    className="w-full text-left px-2 py-2 rounded hover:bg-muted text-sm"
                  >
                    <div className="font-mono text-xs">{p.codigo}</div>
                    <div className="text-xs text-muted-foreground">{p.nome}</div>
                  </button>
                ))}
              </div>
            )}
            {results.clientes.length > 0 && (
              <div className="p-2 border-t border-border">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 pb-1">Clientes</div>
                {results.clientes.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { navigate(`/clientes`); setOpen(false); setQ(""); }}
                    className="w-full text-left px-2 py-2 rounded hover:bg-muted text-sm"
                  >
                    <div className="font-medium">{c.nome}</div>
                    <div className="text-xs text-muted-foreground">{c.cpfCnpj}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <HelpCircle className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative text-muted-foreground">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Novo Imóvel
        </Button>
      </div>
    </header>
  );
}
