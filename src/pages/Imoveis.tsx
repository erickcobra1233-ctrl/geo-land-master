import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useGeoStore } from "@/store/useGeoStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Plus, Download, Filter, Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { STATUS_LABEL, type ProcessStatus } from "@/data/mockData";
import { Link } from "react-router-dom";

export default function Imoveis() {
  const { imoveis, favoritos, toggleFavorito } = useGeoStore();
  const [q, setQ] = useState("");
  const [mun, setMun] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const municipios = Array.from(new Set(imoveis.map((i) => `${i.municipio}/${i.estado}`)));

  const filtered = useMemo(() => {
    return imoveis.filter((i) => {
      const matchQ = !q || i.nome.toLowerCase().includes(q.toLowerCase()) || i.matricula.includes(q) || i.proprietarioNome.toLowerCase().includes(q.toLowerCase());
      const matchM = mun === "all" || `${i.municipio}/${i.estado}` === mun;
      const matchS = status === "all" || i.status === status;
      return matchQ && matchM && matchS;
    });
  }, [imoveis, q, mun, status]);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        breadcrumb="Cadastros"
        title="Imóveis Rurais"
        subtitle={`${filtered.length} de ${imoveis.length} imóveis em processo de georreferenciamento`}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2"><Download className="w-4 h-4" /> Exportar</Button>
            <Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Novo imóvel</Button>
          </>
        }
      />

      <Card className="p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, matrícula ou proprietário..." className="pl-10" />
          </div>
          <Select value={mun} onValueChange={setMun}>
            <SelectTrigger className="md:w-56"><SelectValue placeholder="Município" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos municípios</SelectItem>
              {municipios.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="md:w-52"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              {(Object.keys(STATUS_LABEL) as ProcessStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 w-10"></th>
                <th className="text-left px-4 py-3">Imóvel</th>
                <th className="text-left px-4 py-3">Matrícula</th>
                <th className="text-left px-4 py-3">Município/UF</th>
                <th className="text-left px-4 py-3">Proprietário</th>
                <th className="text-right px-4 py-3">Área (ha)</th>
                <th className="text-left px-4 py-3">Resp. Técnico</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3 w-24">Progresso</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => toggleFavorito(i.id)}>
                      <Star className={`w-4 h-4 ${favoritos.includes(i.id) ? "fill-warning text-warning" : "text-muted-foreground/40"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/imoveis/${i.id}`} className="font-medium hover:text-primary">{i.nome}</Link>
                    <div className="text-xs text-muted-foreground font-mono">{i.codigoIncra}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{i.matricula}</td>
                  <td className="px-4 py-3 text-xs">{i.municipio}/{i.estado}</td>
                  <td className="px-4 py-3 text-xs">{i.proprietarioNome}</td>
                  <td className="px-4 py-3 text-right font-mono">{i.areaHa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{i.responsavelTecnico}</td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-primary-glow" style={{ width: `${i.progresso}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{i.progresso}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
