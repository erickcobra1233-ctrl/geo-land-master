import { useState, useMemo } from "react";
import { useGeoStore } from "@/store/useGeoStore";
import { MapView } from "@/components/MapView";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Layers, Crosshair, Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_LABEL, type ProcessStatus } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";

export default function MapaPage() {
  const { imoveis, pontos } = useGeoStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [mun, setMun] = useState("all");
  const [st, setSt] = useState("all");
  const [showImoveis, setShowImoveis] = useState(true);
  const [showPontos, setShowPontos] = useState(true);

  const municipios = Array.from(new Set(imoveis.map((i) => `${i.municipio}/${i.estado}`)));

  const filteredImoveis = useMemo(() =>
    imoveis.filter((i) => {
      const mq = !q || i.nome.toLowerCase().includes(q.toLowerCase()) || i.matricula.includes(q) || i.proprietarioNome.toLowerCase().includes(q.toLowerCase());
      const mm = mun === "all" || `${i.municipio}/${i.estado}` === mun;
      const ms = st === "all" || i.status === st;
      return mq && mm && ms;
    }), [imoveis, q, mun, st]);

  const filteredPontos = pontos.filter((p) => filteredImoveis.some((i) => i.id === p.imovelId));

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Painel lateral */}
      <div className="w-80 shrink-0 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="font-display font-bold">Mapa Geoespacial</h2>
          </div>
          <p className="text-xs text-muted-foreground">{filteredImoveis.length} imóveis · {filteredPontos.length} pontos</p>
        </div>

        <div className="p-4 space-y-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar imóvel/proprietário..." className="pl-10" />
          </div>
          <Select value={mun} onValueChange={setMun}>
            <SelectTrigger><SelectValue placeholder="Município" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos municípios</SelectItem>
              {municipios.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
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

        {/* Camadas */}
        <div className="p-4 border-b border-border">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Camadas</div>
          <div className="space-y-1">
            <LayerToggle active={showImoveis} onClick={() => setShowImoveis(!showImoveis)} label="Polígonos dos imóveis" color="bg-primary" />
            <LayerToggle active={showPontos} onClick={() => setShowPontos(!showPontos)} label="Vértices georreferenciados" color="bg-info" />
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Imóveis no mapa
          </div>
          {filteredImoveis.map((i) => (
            <button
              key={i.id}
              onClick={() => navigate(`/imoveis/${i.id}`)}
              className="w-full text-left px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors block"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{i.nome}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{i.municipio}/{i.estado} · {i.areaHa.toFixed(0)} ha</div>
                </div>
                <Crosshair className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
              </div>
              <div className="mt-1.5"><StatusBadge status={i.status} /></div>
            </button>
          ))}
        </div>

        {/* Legenda */}
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
          onImovelClick={(id) => navigate(`/imoveis/${id}`)}
        />
      </div>
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
