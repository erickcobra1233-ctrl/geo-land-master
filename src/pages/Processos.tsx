import { PageHeader } from "@/components/PageHeader";
import { useGeoStore } from "@/store/useGeoStore";
import { Card } from "@/components/ui/card";
import { STATUS_LABEL, type ProcessStatus } from "@/data/mockData";
import { Calendar, User2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <PageHeader
        breadcrumb="Fluxo operacional"
        title="Processos"
        subtitle="Acompanhamento do andamento dos georreferenciamentos por etapa"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 overflow-x-auto pb-4">
        {COLUNAS.map((col) => {
          const items = imoveis.filter((i) => i.status === col);
          return (
            <div key={col} className={`bg-muted/40 rounded-lg border-t-[3px] ${COL_BG[col]} flex flex-col min-h-[300px]`}>
              <div className="px-3 py-2.5 flex items-center justify-between border-b border-border/50">
                <div className="text-xs font-semibold uppercase tracking-wider">{STATUS_LABEL[col]}</div>
                <span className="text-[10px] font-mono bg-card px-1.5 py-0.5 rounded border border-border">{items.length}</span>
              </div>
              <div className="p-2 space-y-2 flex-1">
                {items.map((im) => (
                  <Link key={im.id} to={`/imoveis/${im.id}`}>
                    <Card className="p-3 hover:shadow-elevated transition-shadow cursor-pointer">
                      <div className="text-sm font-semibold leading-tight mb-1.5">{im.nome}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3" /> {im.municipio}/{im.estado}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mb-2">
                        <User2 className="w-3 h-3" /> {im.responsavelTecnico.replace("Eng. ", "")}
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden mb-1.5">
                        <div className="h-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: `${im.progresso}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono text-muted-foreground">{im.areaHa.toFixed(0)} ha</span>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {format(parseISO(im.dataPrevisao), "dd MMM", { locale: ptBR })}
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
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
