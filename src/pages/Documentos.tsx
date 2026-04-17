import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useGeoStore } from "@/store/useGeoStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileText, FileSpreadsheet, FileArchive, Image as ImageIcon, Eye, Download, Search, AlertTriangle, CheckCircle2, Send } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";

const CATS = [
  { id: "all", label: "Todos" },
  { id: "imovel", label: "Imóvel" },
  { id: "pessoal", label: "Pessoais" },
  { id: "tecnico", label: "Técnicos" },
  { id: "campo", label: "Campo" },
  { id: "cartorio", label: "Cartório" },
  { id: "sigef", label: "SIGEF" },
];

export default function Documentos() {
  const { documentos, imoveis } = useGeoStore();
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [imovel, setImovel] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() =>
    documentos.filter((d) => {
      const mc = cat === "all" || d.categoria === cat;
      const mq = !q || d.nome.toLowerCase().includes(q.toLowerCase());
      const mi = imovel === "all" || d.imovelId === imovel;
      const ms = status === "all" || d.status === status;
      return mc && mq && mi && ms;
    }), [documentos, cat, q, imovel, status]);

  const counts = {
    pendente: documentos.filter((d) => d.status === "pendente").length,
    enviado: documentos.filter((d) => d.status === "enviado").length,
    conferido: documentos.filter((d) => d.status === "conferido").length,
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        breadcrumb="Gestão documental"
        title="Documentos"
        subtitle={`${filtered.length} de ${documentos.length} arquivos · ${counts.pendente} pendentes · ${counts.enviado} enviados · ${counts.conferido} conferidos`}
        actions={<Button size="sm" className="gap-2"><Upload className="w-4 h-4" /> Enviar arquivo</Button>}
      />

      {/* KPIs status */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatusKpi icon={AlertTriangle} label="Pendentes" value={counts.pendente} color="warning" active={status === "pendente"} onClick={() => setStatus(status === "pendente" ? "all" : "pendente")} />
        <StatusKpi icon={Send} label="Enviados" value={counts.enviado} color="info" active={status === "enviado"} onClick={() => setStatus(status === "enviado" ? "all" : "enviado")} />
        <StatusKpi icon={CheckCircle2} label="Conferidos" value={counts.conferido} color="success" active={status === "conferido"} onClick={() => setStatus(status === "conferido" ? "all" : "conferido")} />
      </div>

      {/* Filtros */}
      <Card className="p-3 mb-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar documento por nome..." className="pl-10" />
        </div>
        <Select value={imovel} onValueChange={setImovel}>
          <SelectTrigger className="md:w-64"><SelectValue placeholder="Imóvel" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos imóveis</SelectItem>
            {imoveis.map((i) => <SelectItem key={i.id} value={i.id}>{i.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {CATS.map((c) => {
          const count = c.id === "all" ? documentos.length : documentos.filter((d) => d.categoria === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-all ${
                cat === c.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {c.label}
              <span className="ml-1.5 font-mono text-[10px] opacity-80">{count}</span>
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border data-table">
              <th className="text-left px-4 py-3">Documento</th>
              <th className="text-left px-4 py-3">Imóvel</th>
              <th className="text-left px-4 py-3">Categoria</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-right px-4 py-3">Tamanho</th>
              <th className="text-left px-4 py-3">Data</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 80).map((d) => {
              const im = imoveis.find((i) => i.id === d.imovelId);
              return (
                <tr key={d.id} className="border-b border-border hover:bg-muted/40">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <DocIcon tipo={d.tipo} />
                      <span className="font-medium">{d.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {im ? <Link to={`/imoveis/${im.id}`} className="text-primary hover:underline">{im.nome}</Link> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-xs"><span className="px-2 py-0.5 bg-muted rounded">{d.categoria}</span></td>
                  <td className="px-4 py-2.5 text-xs font-mono">{d.tipo}</td>
                  <td className="px-4 py-2.5 text-xs font-mono text-right text-muted-foreground">{d.tamanho}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{format(parseISO(d.data), "dd MMM yyyy", { locale: ptBR })}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                      d.status === "conferido" ? "bg-success/15 text-success" :
                      d.status === "pendente" ? "bg-warning/15 text-warning" : "bg-info/15 text-info"
                    }`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <button className="hover:text-foreground p-1"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="hover:text-foreground p-1"><Download className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center py-12 text-sm text-muted-foreground">Nenhum documento encontrado.</td></tr>
            )}
          </tbody>
        </table>
        {filtered.length > 80 && (
          <div className="px-4 py-2 text-[11px] text-muted-foreground border-t border-border bg-muted/30">
            Exibindo 80 de {filtered.length}. Refine os filtros para ver outros.
          </div>
        )}
      </Card>
    </div>
  );
}

function StatusKpi({ icon: Icon, label, value, color, active, onClick }: any) {
  const colorMap: Record<string, string> = {
    warning: "bg-warning/10 text-warning border-warning/30",
    info: "bg-info/10 text-info border-info/30",
    success: "bg-success/10 text-success border-success/30",
  };
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-lg border transition-all ${active ? colorMap[color] + " ring-2 ring-offset-1 ring-offset-background" : "bg-card border-border hover:shadow-elevated"}`}
    >
      <div className="flex items-center justify-between">
        <Icon className={`w-5 h-5 ${active ? "" : `text-${color}`}`} />
        <span className="text-2xl font-display font-bold">{value}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </button>
  );
}

function DocIcon({ tipo }: { tipo: string }) {
  if (tipo === "PDF") return <FileText className="w-4 h-4 text-destructive" />;
  if (tipo === "DWG" || tipo === "KML") return <FileSpreadsheet className="w-4 h-4 text-info" />;
  if (tipo === "ZIP") return <FileArchive className="w-4 h-4 text-warning" />;
  return <ImageIcon className="w-4 h-4 text-secondary" />;
}
