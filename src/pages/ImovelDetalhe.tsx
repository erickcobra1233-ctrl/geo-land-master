import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDocumentos, useHistorico } from "@/hooks/useDocumentos";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { MapView } from "@/components/MapView";
import { ArrowLeft, Pencil, Download, FileText, Image as ImageIcon, FileSpreadsheet, FileArchive, Eye, AlertTriangle, Clock, Calendar, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { slaInfo } from "@/data/mockData";
import { toast } from "sonner";
import { useImovel, useDeleteImovel, useImoveis } from "@/hooks/useImoveis";
import { ImovelFormDialog } from "@/components/forms/ImovelFormDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ImovelDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: documentos = [] } = useDocumentos(id);
  const { data: historico = [] } = useHistorico(id);

  // Tenta buscar pelo backend; se ainda não estiver cacheado, cai pra lista
  const { data: imRemote, isLoading, isError, error } = useImovel(id);
  const { data: imoveisList = [] } = useImoveis();
  const im = imRemote || imoveisList.find((x) => x.id === id);

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteMut = useDeleteImovel();

  if (isLoading && !im) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Carregando imóvel...
        </Card>
      </div>
    );
  }

  if (!im) {
    return (
      <div className="p-6">
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            {isError ? `Erro: ${(error as Error).message}` : "Imóvel não encontrado."}
          </div>
          <Button onClick={() => navigate("/imoveis")} className="mt-4">Voltar</Button>
        </Card>
      </div>
    );
  }

  async function handleDelete() {
    if (!im) return;
    await deleteMut.mutateAsync(im.id);
    setConfirmDelete(false);
    navigate("/imoveis");
  }

  const vertices = im.vertices || [];
  const confrontantes = im.confrontantes || [];
  const docs = documentos.filter((d) => d.imovelId === im.id);
  const hist = historico.filter((h) => h.imovelId === im.id);
  const sla = slaInfo(im);
  const docsPendentes = docs.filter((d) => d.status === "pendente").length;
  const docsConferidos = docs.filter((d) => d.status === "conferido").length;

  function exportVerticesCSV() {
    if (!im) return;
    const header = ["codigo", "tipo", "leste", "norte", "latitude", "longitude", "altitude", "datum", "sistema", "metodo", "precisao_m", "data"];
    const rows = vertices.map((v) => [v.codigo, v.tipo, v.leste, v.norte, v.latitude, v.longitude, v.altitude.toFixed(2), v.datum, v.sistema, v.metodo, v.precisao.toFixed(3), v.data]);
    const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `vertices-${im.matricula.replace(/\W/g, "-")}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`${vertices.length} vértices exportados`);
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <Link to="/imoveis" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
        <ArrowLeft className="w-3.5 h-3.5" /> Imóveis
      </Link>
      <PageHeader
        breadcrumb={`Imóvel · ${im.codigoIncra}`}
        title={im.nome}
        subtitle={`${im.municipio}/${im.estado} · ${im.areaHa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ha · Matrícula ${im.matricula}`}
        actions={
          <>
            <StatusBadge status={im.status} />
            <Button variant="outline" size="sm" className="gap-2" onClick={exportVerticesCSV}>
              <Download className="w-4 h-4" /> Exportar vértices
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-4 h-4" /> Excluir
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setEditOpen(true)}>
              <Pencil className="w-4 h-4" /> Editar
            </Button>
          </>
        }
      />

      {/* Status bar — SLA e indicadores operacionais */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <SLAStat label="Prazo" value={sla.rotulo} icon={sla.vencido ? AlertTriangle : sla.proximo ? Clock : Calendar} accent={sla.vencido ? "destructive" : sla.proximo ? "warning" : "muted"} sub={`prev. ${format(parseISO(im.dataPrevisao), "dd/MM/yyyy")}`} />
        <SLAStat label="Vértices" value={String(vertices.length)} icon={FileSpreadsheet} accent="primary" sub={`${confrontantes.length} confrontantes`} />
        <SLAStat label="Documentos" value={`${docsConferidos}/${docs.length}`} icon={CheckCircle2} accent={docsPendentes > 0 ? "warning" : "success"} sub={`${docsPendentes} pendentes`} />
        <SLAStat label="Progresso" value={`${im.progresso}%`} icon={Calendar} accent="info" sub={`início ${format(parseISO(im.dataInicio), "dd/MM/yyyy")}`} />
        <SLAStat label="Situação" value={im.situacao} icon={CheckCircle2} accent="muted" sub={im.notasInternas ? "notas internas" : "—"} />
      </div>

      <Tabs defaultValue="info" className="space-y-4" onValueChange={() => { /* trigger remount of map below */ }}>
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="mapa">Mapa do Imóvel</TabsTrigger>
          <TabsTrigger value="vertices">Pontos & Vértices ({vertices.length})</TabsTrigger>
          <TabsTrigger value="confrontantes">Confrontantes ({confrontantes.length})</TabsTrigger>
          <TabsTrigger value="documentos">Documentos ({docs.length})</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        {/* INFO */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-5 lg:col-span-2">
              <div className="text-sm font-display font-semibold mb-4">Dados do imóvel</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <Field label="Nome" value={im.nome} />
                <Field label="Matrícula" value={im.matricula} mono />
                <Field label="Código INCRA" value={im.codigoIncra} mono />
                <Field label="CCIR" value={im.ccir} mono />
                <Field label="Município / Comarca" value={`${im.municipio} / ${im.comarca}`} />
                <Field label="Estado" value={im.estado} />
                <Field label="Área (ha)" value={im.areaHa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} mono />
                <Field label="Área (m²)" value={im.areaM2.toLocaleString("pt-BR")} mono />
                <Field label="Situação" value={im.situacao} />
                <Field label="Data de início" value={format(parseISO(im.dataInicio), "dd/MM/yyyy")} />
              </div>
            </Card>
            <Card className="p-5">
              <div className="text-sm font-display font-semibold mb-4">Proprietário</div>
              <div className="space-y-3 text-sm">
                <Field label="Nome" value={im.proprietarioNome} />
                <Field label="CPF/CNPJ" value={im.cpfCnpj} mono />
                {im.conjuge && <Field label="Cônjuge" value={im.conjuge} />}
              </div>
              <div className="my-5 h-px bg-border" />
              <div className="text-sm font-display font-semibold mb-3">Equipe</div>
              <div className="space-y-3 text-sm">
                <Field label="Responsável técnico" value={im.responsavelTecnico} />
                <Field label="Equipe de campo" value={im.equipeCampo.join(", ")} />
              </div>
            </Card>
          </div>
          {im.notasInternas && (
            <Card className="p-5 border-info/30 bg-info/5">
              <div className="text-sm font-display font-semibold mb-2">Notas internas</div>
              <div className="text-sm text-foreground/80">{im.notasInternas}</div>
            </Card>
          )}
        </TabsContent>

        {/* MAPA */}
        <TabsContent value="mapa" forceMount={false as any}>
          <Card className="overflow-hidden p-0">
            <div className="h-[560px]">
              <MapView key={`map-${im.id}`} imoveis={[im]} pontos={[]} fitTo={im.poligono} />
            </div>
            <div className="p-4 border-t border-border flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-primary/60 border border-primary" /> Polígono do imóvel</div>
              <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-info" /> Vértices</div>
              <div className="ml-auto text-muted-foreground font-mono">{vertices.length} vértices · perímetro estimado</div>
            </div>
          </Card>
        </TabsContent>

        {/* VERTICES */}
        <TabsContent value="vertices">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full data-table text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3">Código</th>
                    <th className="text-left px-4 py-3">Tipo</th>
                    <th className="text-right px-4 py-3">Leste (E)</th>
                    <th className="text-right px-4 py-3">Norte (N)</th>
                    <th className="text-right px-4 py-3">Latitude</th>
                    <th className="text-right px-4 py-3">Longitude</th>
                    <th className="text-right px-4 py-3">Alt (m)</th>
                    <th className="text-left px-4 py-3">Datum</th>
                    <th className="text-left px-4 py-3">Método</th>
                    <th className="text-right px-4 py-3">Prec. (m)</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {vertices.map((v) => (
                    <tr key={v.id} className="border-b border-border hover:bg-muted/40">
                      <td className="px-4 py-2.5 font-semibold text-primary">{v.codigo}</td>
                      <td className="px-4 py-2.5"><span className="px-1.5 py-0.5 bg-muted rounded text-[10px]">{v.tipo}</span></td>
                      <td className="px-4 py-2.5 text-right">{v.leste.toFixed(3)}</td>
                      <td className="px-4 py-2.5 text-right">{v.norte.toFixed(3)}</td>
                      <td className="px-4 py-2.5 text-right">{v.latitude.toFixed(6)}</td>
                      <td className="px-4 py-2.5 text-right">{v.longitude.toFixed(6)}</td>
                      <td className="px-4 py-2.5 text-right">{v.altitude.toFixed(2)}</td>
                      <td className="px-4 py-2.5 font-sans text-muted-foreground">{v.datum}</td>
                      <td className="px-4 py-2.5 font-sans text-muted-foreground">{v.metodo}</td>
                      <td className="px-4 py-2.5 text-right">{v.precisao.toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* CONFRONTANTES */}
        <TabsContent value="confrontantes">
          <Card className="overflow-hidden">
            <table className="w-full data-table text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3">Confrontante</th>
                  <th className="text-left px-4 py-3">Tipo de divisa</th>
                  <th className="text-left px-4 py-3">Lado</th>
                  <th className="text-left px-4 py-3">Documento</th>
                  <th className="text-left px-4 py-3">Observações</th>
                </tr>
              </thead>
              <tbody>
                {confrontantes.map((c) => (
                  <tr key={c.id} className="border-b border-border hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{c.nome}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 bg-muted rounded text-xs">{c.tipoDivisa}</span></td>
                    <td className="px-4 py-3 text-xs">{c.lado}</td>
                    <td className="px-4 py-3 text-xs font-mono">{c.documento || "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.obs || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        {/* DOCUMENTOS */}
        <TabsContent value="documentos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {docs.map((d) => (
              <Card key={d.id} className="p-4 hover:shadow-elevated transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <DocIcon tipo={d.tipo} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{d.nome}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {d.tipo} · {d.tamanho} · {format(parseISO(d.data), "dd MMM yyyy", { locale: ptBR })}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                        d.status === "conferido" ? "bg-success/15 text-success" :
                        d.status === "pendente" ? "bg-warning/15 text-warning" : "bg-info/15 text-info"
                      }`}>
                        {d.status}
                      </span>
                      <button className="text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* HISTÓRICO */}
        <TabsContent value="historico">
          <Card className="p-6">
            <div className="space-y-0">
              {hist.map((h, idx) => (
                <div key={h.id} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/15 mt-1.5" />
                    {idx < hist.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="text-xs text-muted-foreground font-mono">{format(parseISO(h.data), "dd/MM/yyyy")}</div>
                    <div className="text-sm font-medium mt-0.5">{h.acao}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">por {h.usuario}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <ImovelFormDialog open={editOpen} onOpenChange={setEditOpen} imovel={im} />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir imóvel?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{im.nome}</strong> (matrícula {im.matricula}) será removido do banco. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMut.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMut.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMut.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
      <div className={`mt-0.5 ${mono ? "font-mono text-xs" : ""}`}>{value}</div>
    </div>
  );
}

function DocIcon({ tipo }: { tipo: string }) {
  if (tipo === "PDF") return <FileText className="w-5 h-5 text-destructive" />;
  if (tipo === "DWG" || tipo === "KML") return <FileSpreadsheet className="w-5 h-5 text-info" />;
  if (tipo === "ZIP") return <FileArchive className="w-5 h-5 text-warning" />;
  if (tipo === "JPG" || tipo === "PNG") return <ImageIcon className="w-5 h-5 text-secondary" />;
  return <FileText className="w-5 h-5 text-muted-foreground" />;
}

function SLAStat({ label, value, sub, icon: Icon, accent }: { label: string; value: string; sub: string; icon: any; accent: "primary" | "info" | "success" | "warning" | "destructive" | "muted" }) {
  const map: Record<string, string> = {
    primary: "bg-primary/10 text-primary border-primary/20",
    info: "bg-info/10 text-info border-info/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/30",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <div className="bg-card border border-border rounded-lg p-3 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-md border flex items-center justify-center shrink-0 ${map[accent]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
        <div className="text-sm font-display font-semibold truncate" title={value}>{value}</div>
        <div className="text-[10px] text-muted-foreground truncate" title={sub}>{sub}</div>
      </div>
    </div>
  );
}
