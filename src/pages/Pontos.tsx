import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { usePontos, useCreatePonto, useDeletePonto } from "@/hooks/usePontos";
import { useImoveis } from "@/hooks/useImoveis";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Upload, MapPinned, Download, Link2, Unlink, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapView } from "@/components/MapView";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Pontos() {
  const { data: pontos = [] } = usePontos();
  const { data: imoveis = [] } = useImoveis();
  const createPonto = useCreatePonto();
  const deletePonto = useDeletePonto();
  const [novoOpen, setNovoOpen] = useState(false);
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("all");
  const [mun, setMun] = useState("all");
  const [imovel, setImovel] = useState("all");
  const [oper, setOper] = useState("all");
  const [vinc, setVinc] = useState<"all" | "vinculado" | "avulso">("all");

  const tipos = Array.from(new Set(pontos.map((p) => p.tipo)));
  const municipios = Array.from(new Set(pontos.map((p) => p.municipio)));

  const filtered = useMemo(() =>
    pontos.filter((p) => {
      const mq = !q || p.codigo.toLowerCase().includes(q.toLowerCase()) || p.nome.toLowerCase().includes(q.toLowerCase());
      const mt = tipo === "all" || p.tipo === tipo;
      const mm = mun === "all" || p.municipio === mun;
      const mi = imovel === "all" || p.imovelId === imovel;
      const mo = oper === "all" || p.operador === oper;
      const mv = vinc === "all" || (vinc === "vinculado" ? !!p.imovelId : !p.imovelId);
      return mq && mt && mm && mi && mo && mv;
    }), [pontos, q, tipo, mun, imovel, oper, vinc]);

  const imoveisDosFiltrados = imoveis.filter((i) => filtered.some((p) => p.imovelId === i.id));

  const stats = {
    total: pontos.length,
    avulsos: pontos.filter((p) => !p.imovelId).length,
    marcos: pontos.filter((p) => p.tipo === "Marco").length,
    apoio: pontos.filter((p) => p.tipo === "Apoio").length,
    levant: pontos.filter((p) => p.tipo === "Levantamento").length,
    refer: pontos.filter((p) => p.tipo === "Referência").length,
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        breadcrumb="Banco geodésico"
        title="Pontos & Vértices"
        subtitle={`${filtered.length} de ${pontos.length} pontos · ${stats.avulsos} avulsos reutilizáveis · ${stats.refer} RN/IBGE`}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => exportarCSV(filtered)}><Download className="w-4 h-4" /> Exportar</Button>
            <Button size="sm" className="gap-2" onClick={() => setNovoOpen(true)}><Plus className="w-4 h-4" /> Novo ponto</Button>
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
            <MapView imoveis={imoveisDosFiltrados} pontos={filtered.slice(0, 300)} />
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-display font-semibold mb-4">Filtros</div>
          <div className="space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Código ou nome..." className="pl-10 font-mono text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos tipos</SelectItem>
                  {tipos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={vinc} onValueChange={(v) => setVinc(v as typeof vinc)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="vinculado">Vinculados</SelectItem>
                  <SelectItem value="avulso">Avulsos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select value={mun} onValueChange={setMun}>
              <SelectTrigger><SelectValue placeholder="Município" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos municípios</SelectItem>
                {municipios.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={imovel} onValueChange={setImovel}>
              <SelectTrigger><SelectValue placeholder="Imóvel" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos imóveis</SelectItem>
                {imoveis.map((i) => <SelectItem key={i.id} value={i.id}>{i.nome}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={oper} onValueChange={setOper}>
              <SelectTrigger><SelectValue placeholder="Operador" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos operadores</SelectItem>
                {Array.from(new Set(pontos.map((p) => p.operador).filter(Boolean))).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-y-1.5 text-[11px]">
            <span className="text-muted-foreground">Marcos</span><span className="font-mono font-semibold text-right">{stats.marcos}</span>
            <span className="text-muted-foreground">Apoio</span><span className="font-mono font-semibold text-right">{stats.apoio}</span>
            <span className="text-muted-foreground">Levantamento</span><span className="font-mono font-semibold text-right">{stats.levant}</span>
            <span className="text-muted-foreground">Referência</span><span className="font-mono font-semibold text-right">{stats.refer}</span>
            <span className="text-muted-foreground">Avulsos</span><span className="font-mono font-semibold text-right">{stats.avulsos}</span>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2.5">Código</th>
                <th className="text-left px-3 py-2.5">Tipo</th>
                <th className="text-left px-3 py-2.5">Vínculo</th>
                <th className="text-right px-3 py-2.5">Latitude</th>
                <th className="text-right px-3 py-2.5">Longitude</th>
                <th className="text-right px-3 py-2.5">Alt (m)</th>
                <th className="text-left px-3 py-2.5">Datum</th>
                <th className="text-left px-3 py-2.5">Método</th>
                <th className="text-left px-3 py-2.5">Equipamento</th>
                <th className="text-left px-3 py-2.5">Município</th>
                <th className="text-right px-3 py-2.5">Prec. H (m)</th>
                <th className="text-left px-3 py-2.5">Operador</th>
                <th className="text-right px-3 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {filtered.slice(0, 120).map((p) => {
                const im = imoveis.find((i) => i.id === p.imovelId);
                return (
                  <tr key={p.id} className="border-b border-border hover:bg-muted/40">
                    <td className="px-3 py-2 font-semibold text-primary">{p.codigo}</td>
                    <td className="px-3 py-2"><span className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-sans">{p.tipo}</span></td>
                    <td className="px-3 py-2 font-sans text-[11px]">
                      {im ? (
                        <Link to={`/imoveis/${im.id}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                          <Link2 className="w-3 h-3" /> {im.nome}
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground"><Unlink className="w-3 h-3" /> avulso</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">{p.latitude.toFixed(6)}</td>
                    <td className="px-3 py-2 text-right">{p.longitude.toFixed(6)}</td>
                    <td className="px-3 py-2 text-right">{p.altitude.toFixed(2)}</td>
                    <td className="px-3 py-2 font-sans text-muted-foreground">{p.datum}</td>
                    <td className="px-3 py-2 font-sans text-muted-foreground">{p.metodo}</td>
                    <td className="px-3 py-2 font-sans text-muted-foreground">{p.equipamento}</td>
                    <td className="px-3 py-2 font-sans">{p.municipio}</td>
                    <td className="px-3 py-2 text-right">{p.precisaoH.toFixed(3)}</td>
                    <td className="px-3 py-2 font-sans text-muted-foreground">{p.operador.replace("Eng. ", "")}</td>
                    <td className="px-2 py-2 text-right">
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => { if (confirm(`Excluir ponto ${p.codigo}?`)) deletePonto.mutate(p.id); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={13} className="text-center py-10 text-muted-foreground font-sans">Nenhum ponto corresponde aos filtros.</td></tr>
              )}
            </tbody>
          </table>
          {filtered.length > 120 && (
            <div className="px-4 py-2 text-[11px] text-muted-foreground border-t border-border bg-muted/30">
              Exibindo 120 de {filtered.length} pontos. Refine os filtros para ver outros.
            </div>
          )}
        </div>
      </Card>

      <NovoPontoDialog
        open={novoOpen}
        onOpenChange={setNovoOpen}
        onSubmit={async (data) => { await createPonto.mutateAsync(data); setNovoOpen(false); }}
        imoveis={imoveis}
        saving={createPonto.isPending}
      />
    </div>
  );
}

function exportarCSV(pontos: ReturnType<typeof usePontos>["data"] extends infer T ? (T extends undefined ? never : T) : never) {
  if (!pontos || pontos.length === 0) return;
  const head = ["codigo","nome","tipo","latitude","longitude","altitude","datum","sistema","precisao_h","operador","municipio"];
  const rows = pontos.map((p) => [p.codigo,p.nome,p.tipo,p.latitude,p.longitude,p.altitude,p.datum,p.sistema,p.precisaoH,p.operador,p.municipio].join(","));
  const csv = [head.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "pontos.csv"; a.click(); URL.revokeObjectURL(url);
}

function NovoPontoDialog({ open, onOpenChange, onSubmit, imoveis, saving }: any) {
  const [form, setForm] = useState({ codigo: "", nome: "", tipo: "Marco", latitude: 0, longitude: 0, altitude: 0, datum: "SIRGAS 2000", sistema: "UTM 22S", metodo: "GNSS RTK", equipamento: "", municipio: "", operador: "", imovelId: "", precisaoH: 0.01, precisaoV: 0.02 });
  function set<K extends keyof typeof form>(k: K, v: any) { setForm((s) => ({ ...s, [k]: v })); }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Novo ponto</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, imovelId: form.imovelId || undefined }); }} className="grid grid-cols-2 gap-3">
          <Field label="Código *"><Input required value={form.codigo} onChange={(e) => set("codigo", e.target.value)} className="font-mono" /></Field>
          <Field label="Tipo">
            <Select value={form.tipo} onValueChange={(v) => set("tipo", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Marco","Apoio","Levantamento","Referência","Auxiliar"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nome" className="col-span-2"><Input value={form.nome} onChange={(e) => set("nome", e.target.value)} /></Field>
          <Field label="Latitude"><Input type="number" step="0.000001" value={form.latitude} onChange={(e) => set("latitude", Number(e.target.value))} /></Field>
          <Field label="Longitude"><Input type="number" step="0.000001" value={form.longitude} onChange={(e) => set("longitude", Number(e.target.value))} /></Field>
          <Field label="Altitude (m)"><Input type="number" step="0.01" value={form.altitude} onChange={(e) => set("altitude", Number(e.target.value))} /></Field>
          <Field label="Precisão H (m)"><Input type="number" step="0.001" value={form.precisaoH} onChange={(e) => set("precisaoH", Number(e.target.value))} /></Field>
          <Field label="Datum"><Input value={form.datum} onChange={(e) => set("datum", e.target.value)} /></Field>
          <Field label="Equipamento"><Input value={form.equipamento} onChange={(e) => set("equipamento", e.target.value)} /></Field>
          <Field label="Município"><Input value={form.municipio} onChange={(e) => set("municipio", e.target.value)} /></Field>
          <Field label="Operador"><Input value={form.operador} onChange={(e) => set("operador", e.target.value)} /></Field>
          <Field label="Vincular ao imóvel" className="col-span-2">
            <Select value={form.imovelId || "none"} onValueChange={(v) => set("imovelId", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Nenhum (avulso)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum (ponto avulso)</SelectItem>
                {imoveis.map((i: any) => <SelectItem key={i.id} value={i.id}>{i.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter className="col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label className="text-xs text-muted-foreground">{label}</Label><div className="mt-1">{children}</div></div>;
}
