import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useGeoStore } from "@/store/useGeoStore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Upload, MapPinned } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapView } from "@/components/MapView";

export default function Pontos() {
  const { pontos, imoveis } = useGeoStore();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("all");
  const [mun, setMun] = useState("all");

  const tipos = Array.from(new Set(pontos.map((p) => p.tipo)));
  const municipios = Array.from(new Set(pontos.map((p) => p.municipio)));

  const filtered = useMemo(() =>
    pontos.filter((p) => {
      const mq = !q || p.codigo.toLowerCase().includes(q.toLowerCase()) || p.nome.toLowerCase().includes(q.toLowerCase());
      const mt = tipo === "all" || p.tipo === tipo;
      const mm = mun === "all" || p.municipio === mun;
      return mq && mt && mm;
    }), [pontos, q, tipo, mun]);

  const imoveisDosFiltrados = imoveis.filter((i) => filtered.some((p) => p.imovelId === i.id));

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        breadcrumb="Banco geodésico"
        title="Pontos & Vértices"
        subtitle={`${filtered.length} pontos georreferenciados disponíveis para reuso`}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2"><Upload className="w-4 h-4" /> Importar CSV</Button>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Novo ponto</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="text-sm font-display font-semibold flex items-center gap-2">
              <MapPinned className="w-4 h-4 text-primary" /> Pontos no mapa
            </div>
            <div className="text-xs text-muted-foreground font-mono">{filtered.length} pontos</div>
          </div>
          <div className="h-[360px]">
            <MapView imoveis={imoveisDosFiltrados} pontos={filtered.slice(0, 200)} />
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-display font-semibold mb-4">Filtros</div>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Código ou nome..." className="pl-10" />
            </div>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {tipos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={mun} onValueChange={setMun}>
              <SelectTrigger><SelectValue placeholder="Município" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos municípios</SelectItem>
                {municipios.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-5 pt-4 border-t border-border space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Marcos</span><span className="font-mono font-semibold">{pontos.filter(p => p.tipo === "Marco").length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Apoio</span><span className="font-mono font-semibold">{pontos.filter(p => p.tipo === "Apoio").length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Levantamento</span><span className="font-mono font-semibold">{pontos.filter(p => p.tipo === "Levantamento").length}</span></div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3">Código</th>
                <th className="text-left px-4 py-3">Tipo</th>
                <th className="text-right px-4 py-3">Latitude</th>
                <th className="text-right px-4 py-3">Longitude</th>
                <th className="text-right px-4 py-3">Alt (m)</th>
                <th className="text-left px-4 py-3">Datum</th>
                <th className="text-left px-4 py-3">Método</th>
                <th className="text-left px-4 py-3">Equipamento</th>
                <th className="text-left px-4 py-3">Município</th>
                <th className="text-right px-4 py-3">Prec. H (m)</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {filtered.slice(0, 80).map((p) => (
                <tr key={p.id} className="border-b border-border hover:bg-muted/40">
                  <td className="px-4 py-2.5 font-semibold text-primary">{p.codigo}</td>
                  <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-sans">{p.tipo}</span></td>
                  <td className="px-4 py-2.5 text-right">{p.latitude.toFixed(6)}</td>
                  <td className="px-4 py-2.5 text-right">{p.longitude.toFixed(6)}</td>
                  <td className="px-4 py-2.5 text-right">{p.altitude.toFixed(2)}</td>
                  <td className="px-4 py-2.5 font-sans text-muted-foreground">{p.datum}</td>
                  <td className="px-4 py-2.5 font-sans text-muted-foreground">{p.metodo}</td>
                  <td className="px-4 py-2.5 font-sans text-muted-foreground">{p.equipamento}</td>
                  <td className="px-4 py-2.5 font-sans">{p.municipio}</td>
                  <td className="px-4 py-2.5 text-right">{p.precisaoH.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
