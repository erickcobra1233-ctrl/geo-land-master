import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { usePontos, useCreatePonto, useCreatePontosBulk, useDeletePonto, useDeletePontosBulk } from "@/hooks/usePontos";
import { useImoveis } from "@/hooks/useImoveis";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Upload, MapPinned, Download, Link2, Unlink, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapView } from "@/components/MapView";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Pontos() {
  const { data: pontos = [] } = usePontos();
  const { data: imoveis = [] } = useImoveis();
  const createPonto = useCreatePonto();
  const createBulk = useCreatePontosBulk();
  const deletePonto = useDeletePonto();
  const deleteBulk = useDeletePontosBulk();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [novoOpen, setNovoOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
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
            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                disabled={deleteBulk.isPending}
                onClick={async () => {
                  if (!confirm(`Excluir ${selectedIds.size} ponto(s) selecionado(s)?`)) return;
                  await deleteBulk.mutateAsync(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }}
              >
                <Trash2 className="w-4 h-4" /> Excluir {selectedIds.size}
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setImportOpen(true)}><Upload className="w-4 h-4" /> Importar (Posição)</Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => exportarPosicao(filtered)}><Download className="w-4 h-4" /> Exportar (Posição)</Button>
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
                  {tipos.filter(Boolean).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
                {municipios.filter(Boolean).map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={imovel} onValueChange={setImovel}>
              <SelectTrigger><SelectValue placeholder="Imóvel" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos imóveis</SelectItem>
                {imoveis.filter((i) => i.id).map((i) => <SelectItem key={i.id} value={i.id}>{i.nome}</SelectItem>)}
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

      <ImportarPontosDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        imoveis={imoveis}
        saving={createBulk.isPending}
        onSubmit={async (lista) => { await createBulk.mutateAsync(lista); setImportOpen(false); }}
      />
    </div>
  );
}

async function exportarPosicao(pontos: ReturnType<typeof usePontos>["data"] extends infer T ? (T extends undefined ? never : T) : never) {
  if (!pontos || pontos.length === 0) {
    alert("Nenhum ponto para exportar.");
    return;
  }
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  // Linhas no padrão Posição: Código N E Cota Descrição
  // N (Norte) e E (Leste) em metros (UTM). Quando ausente, usa 0.
  const linhas = pontos.map((p) => {
    const codigo = (p.codigo || "").replace(/\s+/g, "_");
    const norte = Number(p.norte ?? 0).toFixed(3);
    const leste = Number(p.leste ?? 0).toFixed(3);
    const cota = Number(p.altitude ?? 0).toFixed(3);
    const desc = (p.descricao || p.tipo || p.nome || "").replace(/[\r\n;,\t]+/g, " ").trim() || "PONTO";
    return { codigo, norte, leste, cota, desc };
  });

  // 1. TXT separado por espaço (formato clássico Posição)
  const txtEspaco = linhas
    .map((l) => `${l.codigo} ${l.norte} ${l.leste} ${l.cota} ${l.desc}`)
    .join("\r\n");
  zip.file("pontos_posicao_espaco.txt", txtEspaco);

  // 2. TXT separado por vírgula
  const txtVirgula = linhas
    .map((l) => `${l.codigo},${l.norte},${l.leste},${l.cota},${l.desc}`)
    .join("\r\n");
  zip.file("pontos_posicao_virgula.txt", txtVirgula);

  // 3. CSV padrão BR (ponto-e-vírgula) com cabeçalho
  const csv = ["Codigo;Norte;Leste;Cota;Descricao", ...linhas.map((l) => `${l.codigo};${l.norte};${l.leste};${l.cota};${l.desc}`)].join("\r\n");
  zip.file("pontos_posicao.csv", csv);

  // README explicativo
  const readme =
    `Exportação de pontos — formatos compatíveis com Aplicativo Posição (Alezi Teodolini)\r\n` +
    `Gerado em: ${new Date().toLocaleString("pt-BR")}\r\n` +
    `Total de pontos: ${pontos.length}\r\n\r\n` +
    `Arquivos:\r\n` +
    `  - pontos_posicao_espaco.txt   → Código N E Cota Descrição (separado por espaço)\r\n` +
    `  - pontos_posicao_virgula.txt  → Código,N,E,Cota,Descrição (separado por vírgula)\r\n` +
    `  - pontos_posicao.csv          → Código;N;E;Cota;Descrição (CSV padrão BR)\r\n\r\n` +
    `Coordenadas: UTM (Norte e Leste em metros), Datum SIRGAS 2000.\r\n` +
    `Pontos sem N/E preenchidos foram exportados com valor 0.\r\n`;
  zip.file("LEIA-ME.txt", readme);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pontos-posicao-${new Date().toISOString().slice(0, 10)}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

function NovoPontoDialog({ open, onOpenChange, onSubmit, imoveis, saving }: any) {
  const initial = { codigo: "", nome: "", tipo: "Marco", latitude: "", longitude: "", altitude: "", datum: "SIRGAS 2000", sistema: "UTM 22S", metodo: "GNSS RTK", equipamento: "", municipio: "", operador: "", imovelId: "none", precisaoH: "0.01", precisaoV: "0.02" };
  const [form, setForm] = useState(initial);
  // Reset ao reabrir
  useMemo(() => { if (open) setForm(initial); /* eslint-disable-next-line */ }, [open]);
  function set<K extends keyof typeof form>(k: K, v: any) { setForm((s) => ({ ...s, [k]: v })); }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lat = Number(form.latitude);
    const lon = Number(form.longitude);
    if (!form.codigo.trim()) return;
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || (lat === 0 && lon === 0)) {
      alert("Informe latitude e longitude válidas (não podem ser ambas 0).");
      return;
    }
    onSubmit({
      ...form,
      latitude: lat,
      longitude: lon,
      altitude: Number(form.altitude) || 0,
      precisaoH: Number(form.precisaoH) || 0,
      precisaoV: Number(form.precisaoV) || 0,
      imovelId: form.imovelId === "none" ? undefined : form.imovelId,
    });
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Novo ponto</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
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
          <Field label="Latitude *"><Input type="number" step="0.000001" placeholder="-15.781234" value={form.latitude} onChange={(e) => set("latitude", e.target.value)} /></Field>
          <Field label="Longitude *"><Input type="number" step="0.000001" placeholder="-52.934567" value={form.longitude} onChange={(e) => set("longitude", e.target.value)} /></Field>
          <Field label="Altitude (m)"><Input type="number" step="0.01" placeholder="0.00" value={form.altitude} onChange={(e) => set("altitude", e.target.value)} /></Field>
          <Field label="Precisão H (m)"><Input type="number" step="0.001" value={form.precisaoH} onChange={(e) => set("precisaoH", e.target.value)} /></Field>
          <Field label="Datum"><Input value={form.datum} onChange={(e) => set("datum", e.target.value)} /></Field>
          <Field label="Equipamento"><Input value={form.equipamento} onChange={(e) => set("equipamento", e.target.value)} /></Field>
          <Field label="Município"><Input value={form.municipio} onChange={(e) => set("municipio", e.target.value)} /></Field>
          <Field label="Operador"><Input value={form.operador} onChange={(e) => set("operador", e.target.value)} /></Field>
          <Field label="Vincular ao imóvel" className="col-span-2">
            <Select value={form.imovelId} onValueChange={(v) => set("imovelId", v)}>
              <SelectTrigger><SelectValue placeholder="Nenhum (avulso)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum (ponto avulso)</SelectItem>
                {imoveis.filter((i: any) => i.id).map((i: any) => <SelectItem key={i.id} value={i.id}>{i.nome}</SelectItem>)}
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

// ───────────────── Importação Posição ─────────────────
type SeparadorOpt = "auto" | "espaco" | "virgula" | "ponto_virgula" | "tab";
type OrdemOpt = "codigo_n_e_cota_desc" | "codigo_e_n_cota_desc";

function detectarSeparador(linhas: string[]): Exclude<SeparadorOpt, "auto"> {
  const amostra = linhas.find((l) => l.trim().length > 0) || "";
  if (amostra.includes(";")) return "ponto_virgula";
  if (amostra.includes("\t")) return "tab";
  if (amostra.includes(",") && amostra.split(",").length >= 4) return "virgula";
  return "espaco";
}

function splitLinha(linha: string, sep: Exclude<SeparadorOpt, "auto">): string[] {
  if (sep === "espaco") return linha.trim().split(/\s+/);
  if (sep === "virgula") return linha.split(",").map((s) => s.trim());
  if (sep === "ponto_virgula") return linha.split(";").map((s) => s.trim());
  return linha.split("\t").map((s) => s.trim());
}

function parsearArquivo(texto: string, sepOpt: SeparadorOpt, ordem: OrdemOpt, pularCabecalho: boolean) {
  const linhas = texto.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const sep = sepOpt === "auto" ? detectarSeparador(linhas) : sepOpt;
  const dados = pularCabecalho ? linhas.slice(1) : linhas;
  const erros: string[] = [];
  const pontos: Array<Partial<import("@/data/mockData").Ponto>> = [];
  dados.forEach((linha, idx) => {
    const cols = splitLinha(linha, sep);
    if (cols.length < 4) {
      erros.push(`Linha ${idx + 1}: precisa de ao menos 4 colunas (Código, N, E, Cota).`);
      return;
    }
    const codigo = cols[0];
    const a = Number(cols[1].replace(",", "."));
    const b = Number(cols[2].replace(",", "."));
    const cota = Number((cols[3] || "0").replace(",", "."));
    const desc = cols.slice(4).join(" ").trim();
    if (!codigo || !Number.isFinite(a) || !Number.isFinite(b)) {
      erros.push(`Linha ${idx + 1}: código ou coordenadas inválidas.`);
      return;
    }
    const norte = ordem === "codigo_n_e_cota_desc" ? a : b;
    const leste = ordem === "codigo_n_e_cota_desc" ? b : a;
    pontos.push({
      codigo,
      nome: desc || codigo,
      tipo: "Marco",
      descricao: desc,
      norte,
      leste,
      altitude: Number.isFinite(cota) ? cota : 0,
      latitude: 0,
      longitude: 0,
      datum: "SIRGAS 2000",
      sistema: "UTM",
      precisaoH: 0,
      precisaoV: 0,
      metodo: "Importado",
      equipamento: "",
      municipio: "",
      operador: "",
    });
  });
  return { pontos, erros, sep };
}

function ImportarPontosDialog({ open, onOpenChange, onSubmit, imoveis, saving }: any) {
  const [sep, setSep] = useState<SeparadorOpt>("auto");
  const [ordem, setOrdem] = useState<OrdemOpt>("codigo_n_e_cota_desc");
  const [pularCabecalho, setPularCabecalho] = useState(false);
  const [imovelId, setImovelId] = useState<string>("none");
  const [texto, setTexto] = useState("");
  const [nomeArquivo, setNomeArquivo] = useState("");

  useMemo(() => { if (open) { setTexto(""); setNomeArquivo(""); setSep("auto"); setOrdem("codigo_n_e_cota_desc"); setPularCabecalho(false); setImovelId("none"); } /* eslint-disable-next-line */ }, [open]);

  const preview = useMemo(() => {
    if (!texto.trim()) return { pontos: [], erros: [], sep: "espaco" as const };
    return parsearArquivo(texto, sep, ordem, pularCabecalho);
  }, [texto, sep, ordem, pularCabecalho]);

  async function handleArquivo(file: File) {
    setNomeArquivo(file.name);
    const t = await file.text();
    setTexto(t);
  }

  function handleImportar() {
    if (preview.pontos.length === 0) return;
    const lista = preview.pontos.map((p) => ({ ...p, imovelId: imovelId === "none" ? undefined : imovelId }));
    onSubmit(lista);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar pontos (Posição)</DialogTitle>
          <DialogDescription>Aceita TXT/CSV nos formatos do app Posição. Você escolhe o separador e a ordem das colunas.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Arquivo (.txt / .csv)" className="col-span-2">
            <Input type="file" accept=".txt,.csv,.dat,text/plain" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleArquivo(f); }} />
            {nomeArquivo && <div className="text-[11px] text-muted-foreground mt-1">Arquivo: {nomeArquivo}</div>}
          </Field>

          <Field label="Separador">
            <Select value={sep} onValueChange={(v) => setSep(v as SeparadorOpt)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Detectar automaticamente</SelectItem>
                <SelectItem value="espaco">Espaço (Posição clássico)</SelectItem>
                <SelectItem value="virgula">Vírgula</SelectItem>
                <SelectItem value="ponto_virgula">Ponto-e-vírgula (CSV BR)</SelectItem>
                <SelectItem value="tab">Tabulação</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Ordem das colunas">
            <Select value={ordem} onValueChange={(v) => setOrdem(v as OrdemOpt)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="codigo_n_e_cota_desc">Código N E Cota Descrição (Posição)</SelectItem>
                <SelectItem value="codigo_e_n_cota_desc">Código E N Cota Descrição</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Vincular ao imóvel" className="col-span-2">
            <Select value={imovelId} onValueChange={setImovelId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum (pontos avulsos)</SelectItem>
                {imoveis.filter((i: any) => i.id).map((i: any) => <SelectItem key={i.id} value={i.id}>{i.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <label className="col-span-2 flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={pularCabecalho} onChange={(e) => setPularCabecalho(e.target.checked)} />
            Pular primeira linha (cabeçalho)
          </label>

          <Field label="Ou cole o conteúdo aqui" className="col-span-2">
            <Textarea
              rows={6}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={"P01 8267543.123 612345.678 542.10 MARCO\nP02 8267550.500 612350.220 542.30 CERCA"}
              className="font-mono text-xs"
            />
          </Field>

          {texto.trim() && (
            <div className="col-span-2 rounded-md border border-border bg-muted/30 p-3">
              <div className="text-xs font-semibold mb-1">
                Prévia: {preview.pontos.length} ponto(s) válido(s)
                {preview.erros.length > 0 && <span className="text-destructive"> · {preview.erros.length} erro(s)</span>}
              </div>
              {preview.pontos.slice(0, 3).map((p, i) => (
                <div key={i} className="text-[11px] font-mono text-muted-foreground">
                  {p.codigo} · N={p.norte?.toFixed(3)} E={p.leste?.toFixed(3)} Cota={p.altitude?.toFixed(2)} {p.descricao}
                </div>
              ))}
              {preview.erros.slice(0, 3).map((e, i) => (
                <div key={`e${i}`} className="text-[11px] text-destructive">{e}</div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" disabled={saving || preview.pontos.length === 0} onClick={handleImportar}>
            {saving ? "Importando..." : `Importar ${preview.pontos.length} ponto(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
