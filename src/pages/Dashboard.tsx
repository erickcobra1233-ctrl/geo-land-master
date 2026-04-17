import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { useGeoStore } from "@/store/useGeoStore";
import { MapView } from "@/components/MapView";
import { StatusBadge } from "@/components/StatusBadge";
import { STATUS_LABEL, type ProcessStatus } from "@/data/mockData";
import {
  Layers, MapPinned, CheckCircle2, AlertTriangle, TrendingUp, Clock, FileWarning, Activity,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip, Cell, PieChart, Pie } from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_HEX: Record<ProcessStatus, string> = {
  campo: "#f59e0b", processamento: "#1e90d6", conferencia: "#9b5de5",
  documentacao: "#c44ba0", sigef: "#27a085", cartorio: "#d4762a",
  concluido: "#3aa86b", pendente: "#e64545",
};

export default function Dashboard() {
  const { imoveis, pontos, documentos } = useGeoStore();
  const navigate = useNavigate();

  const totalImoveis = imoveis.length;
  const emAndamento = imoveis.filter((i) => !["concluido", "pendente"].includes(i.status)).length;
  const concluidos = imoveis.filter((i) => i.status === "concluido").length;
  const pendentes = documentos.filter((d) => d.status === "pendente").length;

  const porStatus = (Object.keys(STATUS_LABEL) as ProcessStatus[]).map((s) => ({
    status: s,
    label: STATUS_LABEL[s].split(" ")[0],
    count: imoveis.filter((i) => i.status === s).length,
    color: STATUS_HEX[s],
  })).filter((d) => d.count > 0);

  const porMunicipio = Object.values(
    imoveis.reduce<Record<string, { mun: string; count: number; ha: number }>>((acc, i) => {
      const k = `${i.municipio}/${i.estado}`;
      acc[k] ??= { mun: k, count: 0, ha: 0 };
      acc[k].count++;
      acc[k].ha += i.areaHa;
      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count);

  const porTipoVertice = ["M", "P", "V"].map((t) => ({
    tipo: t === "M" ? "Marco" : t === "P" ? "Ponto" : "Virtual",
    count: imoveis.flatMap((i) => i.vertices).filter((v) => v.tipo === t).length,
  }));

  const ultimosImoveis = [...imoveis].slice(0, 5);
  const ultimosPontos = [...pontos].slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      <PageHeader
        breadcrumb="Visão geral"
        title="Dashboard"
        subtitle="Indicadores operacionais do escritório de georreferenciamento"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Layers} label="Imóveis cadastrados" value={totalImoveis} accent="primary" trend="+12% mês" />
        <KpiCard icon={Activity} label="Processos em andamento" value={emAndamento} accent="info" trend="ativos" />
        <KpiCard icon={CheckCircle2} label="Concluídos" value={concluidos} accent="success" trend={`${Math.round((concluidos / totalImoveis) * 100)}% do total`} />
        <KpiCard icon={MapPinned} label="Pontos cadastrados" value={pontos.length} accent="secondary" trend="banco geodésico" />
      </div>

      {/* Mapa geral + status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <div>
              <div className="text-sm font-display font-semibold">Mapa geral dos imóveis</div>
              <div className="text-xs text-muted-foreground">Todos os polígonos cadastrados em produção</div>
            </div>
            <Link to="/mapa" className="text-xs font-medium text-primary hover:underline">Abrir mapa completo →</Link>
          </div>
          <div className="h-[420px]">
            <MapView imoveis={imoveis} onImovelClick={(id) => navigate(`/imoveis/${id}`)} />
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-display font-semibold mb-1">Processos por status</div>
          <div className="text-xs text-muted-foreground mb-4">Distribuição atual</div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={porStatus} dataKey="count" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {porStatus.map((d) => <Cell key={d.status} fill={d.color} />)}
                </Pie>
                <RTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {porStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <span>{STATUS_LABEL[s.status]}</span>
                </div>
                <span className="font-mono font-semibold">{s.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Município + Vértices + Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-display font-semibold">Imóveis por município</div>
              <div className="text-xs text-muted-foreground">Distribuição geográfica</div>
            </div>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porMunicipio} layout="vertical" margin={{ left: 24, right: 16 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="mun" tick={{ fontSize: 11 }} width={120} stroke="hsl(var(--muted-foreground))" />
                <RTooltip cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="text-sm font-display font-semibold mb-3">Vértices por tipo</div>
            <div className="space-y-2.5">
              {porTipoVertice.map((v) => (
                <div key={v.tipo}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{v.tipo}</span>
                    <span className="font-mono font-semibold">{v.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: `${(v.count / 60) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 border-warning/30 bg-warning/5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <div className="text-sm font-display font-semibold">Alertas e pendências</div>
            </div>
            <div className="space-y-2 text-xs">
              <AlertItem icon={FileWarning} text={`${pendentes} documentos pendentes de conferência`} />
              <AlertItem icon={Clock} text="3 prazos vencem nesta semana" />
              <AlertItem icon={AlertTriangle} text="2 imóveis sem ART vinculada" />
            </div>
          </Card>
        </div>
      </div>

      {/* Listas recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-display font-semibold">Últimos imóveis cadastrados</div>
            <Link to="/imoveis" className="text-xs text-primary hover:underline">ver todos</Link>
          </div>
          <div className="divide-y divide-border">
            {ultimosImoveis.map((i) => (
              <Link
                key={i.id}
                to={`/imoveis/${i.id}`}
                className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{i.nome}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {i.municipio}/{i.estado} · {i.areaHa.toFixed(2)} ha · Matr. {i.matricula}
                  </div>
                </div>
                <StatusBadge status={i.status} />
              </Link>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-display font-semibold">Últimos pontos inseridos</div>
            <Link to="/pontos" className="text-xs text-primary hover:underline">ver todos</Link>
          </div>
          <div className="divide-y divide-border">
            {ultimosPontos.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <div className="font-mono text-xs font-semibold">{p.codigo}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {p.tipo} · {p.municipio} · {p.equipamento}
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                  {format(parseISO(p.data), "dd MMM", { locale: ptBR })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon, label, value, trend, accent,
}: { icon: any; label: string; value: number | string; trend?: string; accent: "primary" | "info" | "success" | "secondary" }) {
  const accentMap = {
    primary: "bg-primary/10 text-primary",
    info: "bg-info/10 text-info",
    success: "bg-success/10 text-success",
    secondary: "bg-secondary/10 text-secondary",
  };
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${accentMap[accent]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && <span className="text-[10px] text-muted-foreground font-medium">{trend}</span>}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-display font-bold tracking-tight">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function AlertItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-start gap-2 text-foreground/80">
      <Icon className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}
