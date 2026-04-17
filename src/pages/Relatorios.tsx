import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGeoStore } from "@/store/useGeoStore";
import { FileBarChart, MapPinned, Building2, ListChecks, UserCheck, AlertTriangle, Download } from "lucide-react";

const RELATORIOS = [
  { icon: Building2, title: "Imóveis cadastrados", desc: "Listagem completa de todos os imóveis com áreas e proprietários", color: "text-primary bg-primary/10" },
  { icon: MapPinned, title: "Pontos cadastrados", desc: "Banco geodésico com coordenadas, datum e precisões", color: "text-info bg-info/10" },
  { icon: ListChecks, title: "Relatório por status", desc: "Imóveis agrupados por etapa do processo", color: "text-secondary bg-secondary/10" },
  { icon: Building2, title: "Relatório por município", desc: "Distribuição geográfica dos imóveis e áreas", color: "text-success bg-success/10" },
  { icon: UserCheck, title: "Relatório por responsável técnico", desc: "Carga de trabalho por engenheiro responsável", color: "text-status-conferencia bg-status-conferencia/10" },
  { icon: AlertTriangle, title: "Pendências documentais", desc: "Documentos faltantes ou aguardando conferência", color: "text-warning bg-warning/10" },
];

export default function Relatorios() {
  const { imoveis, pontos, documentos } = useGeoStore();

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        breadcrumb="Análises"
        title="Relatórios"
        subtitle="Gere relatórios consolidados em PDF e planilha"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 bg-gradient-brand text-primary-foreground">
          <FileBarChart className="w-6 h-6 mb-3 opacity-80" />
          <div className="text-3xl font-display font-bold">{imoveis.length}</div>
          <div className="text-xs opacity-80 mt-1">Imóveis no acervo</div>
        </Card>
        <Card className="p-5">
          <MapPinned className="w-6 h-6 mb-3 text-info" />
          <div className="text-3xl font-display font-bold">{pontos.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Pontos georreferenciados</div>
        </Card>
        <Card className="p-5">
          <FileBarChart className="w-6 h-6 mb-3 text-secondary" />
          <div className="text-3xl font-display font-bold">{documentos.length}</div>
          <div className="text-xs text-muted-foreground mt-1">Documentos arquivados</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RELATORIOS.map((r) => (
          <Card key={r.title} className="p-5 hover:shadow-elevated transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`w-11 h-11 rounded-md flex items-center justify-center shrink-0 ${r.color}`}>
                <r.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-display font-semibold">{r.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{r.desc}</div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs"><Download className="w-3.5 h-3.5" /> PDF</Button>
                  <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs"><Download className="w-3.5 h-3.5" /> Planilha</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
