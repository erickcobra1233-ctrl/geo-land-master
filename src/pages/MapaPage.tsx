import { useState, useMemo } from "react";
import { usePontos } from "@/hooks/usePontos";
import { useImoveis } from "@/hooks/useImoveis";
import { MapView } from "@/components/MapView";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Layers, Crosshair, Eye, EyeOff, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_LABEL, type ProcessStatus, responsaveisUnicos, slaInfo } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";

export default function MapaPage() {
  const { data: pontos = [] } = usePontos();
  const { data: imoveis = [] } = useImoveis();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [mun, setMun] = useState("all");
  const [st, setSt] = useState("all");
  const [resp, setResp] = useState("all");
  const [showImoveis, setShowImoveis] = useState(true);
  const [showPontos, setShowPontos] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const municipios = Array.from(new Set(imoveis.map((i) => `${i.municipio}/${i.estado}`)));

  const filteredImoveis = useMemo(() =>
    imoveis.filter((i) => {
      const mq = !q || i.nome.toLowerCase().includes(q.toLowerCase()) || i.matricula.includes(q) || i.proprietarioNome.toLowerCase().includes(q.toLowerCase());
      const mm = mun === "all" || `${i.municipio}/${i.estado}` === mun;
      const ms = st === "all" || i.status === st;
      const mr = resp === "all" || i.responsavelTecnico === resp;
      return mq && mm && ms && mr;
    }), [imoveis, q, mun, st, resp]);

  const filteredPontos = pontos.filter((p) => filteredImoveis.some((i) => i.id === p.imovelId) || !p.imovelId);
  const totalArea = filteredImoveis.reduce((s, i) => s + i.areaHa, 0);
  const sel = selected ? imoveis.find((i) => i.id === selected) : null;

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Painel lateral */}
      <div className="w-80 shrink-0 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="font-display font-bold">Mapa Geoespacial</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {filteredImoveis.length} imóveis · {totalArea.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} ha · {filteredPontos.length} pontos
          </p>
        </div>

        <div className="p-4 space-y-2.5 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Imóvel, matrícula, proprietário..." className="pl-10" />
          </div>
          <Select value={mun} onValueChange={setMun}>
            <SelectTrigger><SelectValue placeholder="Município" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos municípios</SelectItem>
              {municipios.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={resp} onValueChange={setResp}>
            <SelectTrigger><SelectValue placeholder="Responsável" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos responsáveis</SelectItem>
              {responsaveisUnicos.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={st} onValueChange={setSt}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              {(Object.keys(STATUS_LABEL) as ProcessStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="p-4 border-b border-border">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Camadas</div>
          <div className="space-y-1">
            <LayerToggle active={showImoveis} onClick={() => setShowImoveis(!showImoveis)} label="Polígonos dos imóveis" color="bg-primary" />
            <LayerToggle active={showPontos} onClick={() => setShowPontos(!showPontos)} label="Vértices georreferenciados" color="bg-info" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground sticky top-0 bg-card border-b border-border/50">
            Imóveis no mapa
          </div>
          {filteredImoveis.map((i) => {
            const sla = slaInfo(i);
            const isSel = selected === i.id;
            return (
              <button
                key={i.id}
                onClick={() => setSelected(i.id)}
                className={`w-full text-left px-4 py-2.5 border-b border-border hover:bg-muted/50 transition-colors block ${isSel ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{i.nome}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{i.municipio}/{i.estado} · {i.areaHa.toFixed(0)} ha</div>
                  </div>
                  <Crosshair className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-2">
                  <StatusBadge status={i.status} />
                  {sla.vencido && <span className="text-[10px] text-destructive font-semibold">⚠ {sla.rotulo}</span>}
                </div>
              </button>
            );
          })}
        </div>

        <Card className="m-3 p-3 text-xs">
          <div className="font-semibold mb-2">Legenda de status</div>
          <div className="grid grid-cols-2 gap-1">
            {(Object.keys(STATUS_LABEL) as ProcessStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full bg-status-${s}`} />
                <span className="text-[10px] text-muted-foreground truncate">{STATUS_LABEL[s]}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Mapa */}
      <div className="flex-1 relative">
        <MapView
          imoveis={showImoveis ? filteredImoveis : []}
          pontos={showPontos ? filteredPontos : []}
          onImovelClick={(id) => setSelected(id)}
          fitTo={sel ? sel.poligono : undefined}
        />

        {/* Painel de detalhe flutuante */}
        {sel && (
          <Card className="absolute top-4 right-4 w-80 p-4 shadow-pop z-30 animate-fade-in">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-[11px] text-muted-foreground font-mono">{sel.codigoIncra}</div>
                <div className="font-display font-bold text-base leading-tight">{sel.nome}</div>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
            </div>
            <StatusBadge status={sel.status} />
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <Info label="Matrícula" value={sel.matricula} mono />
              <Info label="Área" value={`${sel.areaHa.toFixed(2)} ha`} mono />
              <Info label="Município" value={`${sel.municipio}/${sel.estado}`} />
              <Info label="Vértices" value={String(sel.vertices.length)} mono />
              <Info label="Proprietário" value={sel.proprietarioNome} full />
              <Info label="Resp. Técnico" value={sel.responsavelTecnico} full />
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: `${sel.progresso}%` }} />
                </div>
                <span className="font-mono text-muted-foreground">{sel.progresso}%</span>
              </div>
              <button
                onClick={() => navigate(`/imoveis/${sel.id}`)}
                className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-0.5"
              >Abrir detalhe <ChevronRight className="w-3 h-3" /></button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, mono, full }: { label: string; value: string; mono?: boolean; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-0.5 truncate ${mono ? "font-mono text-[11px]" : "text-xs font-medium"}`} title={value}>{value}</div>
    </div>
  );
}

function LayerToggle({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors"
    >
      {active ? <Eye className="w-3.5 h-3.5 text-foreground" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className={active ? "" : "text-muted-foreground line-through"}>{label}</span>
    </button>
  );
}
