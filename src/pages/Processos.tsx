import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useGeoStore } from "@/store/useGeoStore";
import { Card } from "@/components/ui/card";
import { STATUS_LABEL, type ProcessStatus, slaInfo, responsaveisUnicos } from "@/data/mockData";
import { Calendar, User2, MapPin, AlertTriangle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const COLUNAS: ProcessStatus[] = ["campo", "processamento", "conferencia", "documentacao", "sigef", "cartorio", "concluido"];

const COL_BG: Record<ProcessStatus, string> = {
  campo: "border-t-status-campo",
  processamento: "border-t-status-processamento",
  conferencia: "border-t-status-conferencia",
  documentacao: "border-t-status-documentacao",
  sigef: "border-t-status-sigef",
  cartorio: "border-t-status-cartorio",
  concluido: "border-t-status-concluido",
  pendente: "border-t-status-pendente",
};

export default function Processos() {
  const { imoveis } = useGeoStore();
  const [resp, setResp] = useState("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() =>
    imoveis.filter((i) =>
      (resp === "all" || i.responsavelTecnico === resp) &&
      (!q || i.nome.toLowerCase().includes(q.toLowerCase()) || i.municipio.toLowerCase().includes(q.toLowerCase()))
    ), [imoveis, resp, q]);

  const vencidos = filtered.filter((i) => slaInfo(i).vencido).length;

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <PageHeader
        breadcrumb="Fluxo operacional"
        title="Processos"
        subtitle={`${filtered.length} processos no quadro · ${vencidos} com prazo vencido`}
      />

      <Card className="p-3 mb-4 flex flex-col md:flex-row gap-3">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar imóvel ou município..." className="flex-1" />
        <Select value={resp} onValueChange={setResp}>
          <SelectTrigger className="md:w-64"><SelectValue placeholder="Responsável" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos responsáveis</SelectItem>
            {responsaveisUnicos.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 overflow-x-auto pb-4">
        {COLUNAS.map((col) => {
          const items = filtered.filter((i) => i.status === col);
          const haAtraso = items.some((i) => slaInfo(i).vencido);
          return (
            <div key={col} className={`bg-muted/40 rounded-lg border-t-[3px] ${COL_BG[col]} flex flex-col min-h-[300px]`}>
              <div className="px-3 py-2.5 flex items-center justify-between border-b border-border/50">
                <div className="text-xs font-semibold uppercase tracking-wider">{STATUS_LABEL[col]}</div>
                <div className="flex items-center gap-1">
                  {haAtraso && <AlertTriangle className="w-3 h-3 text-destructive" />}
                  <span className="text-[10px] font-mono bg-card px-1.5 py-0.5 rounded border border-border">{items.length}</span>
                </div>
              </div>
              <div className="p-2 space-y-2 flex-1">
                {items.map((im) => {
                  const sla = slaInfo(im);
                  return (
                    <Link key={im.id} to={`/imoveis/${im.id}`}>
                      <Card className={`p-2.5 hover:shadow-elevated transition-shadow cursor-pointer ${sla.vencido ? "border-l-2 border-l-destructive" : sla.proximo ? "border-l-2 border-l-warning" : ""}`}>
                        <div className="text-sm font-semibold leading-tight mb-1">{im.nome}</div>
                        <div className="text-[10px] text-muted-foreground font-mono mb-1">Matr. {im.matricula}</div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" /> {im.municipio}/{im.estado}
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1.5">
                          <User2 className="w-2.5 h-2.5" /> {im.responsavelTecnico.replace("Eng. ", "")}
                        </div>
                        <div className="h-1 rounded-full bg-muted overflow-hidden mb-1.5">
                          <div className="h-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: `${im.progresso}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono text-muted-foreground">{im.areaHa.toFixed(0)} ha</span>
                          <span className={`flex items-center gap-1 ${sla.vencido ? "text-destructive font-semibold" : sla.proximo ? "text-warning font-semibold" : "text-muted-foreground"}`}>
                            {sla.vencido ? <AlertTriangle className="w-2.5 h-2.5" /> : <Calendar className="w-2.5 h-2.5" />}
                            {im.status === "concluido" ? format(parseISO(im.dataPrevisao), "dd MMM", { locale: ptBR }) : sla.rotulo}
                          </span>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
                {items.length === 0 && (
                  <div className="text-center text-[10px] text-muted-foreground py-6">Nenhum processo</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
