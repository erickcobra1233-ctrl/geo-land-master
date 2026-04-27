import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useGeoStore } from "@/store/useGeoStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search,
  Plus,
  Download,
  Star,
  ArrowUpDown,
  AlertTriangle,
  Clock,
  Pencil,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import {
  STATUS_LABEL,
  type ProcessStatus,
  type Imovel,
  slaInfo,
  responsaveisUnicos,
} from "@/data/mockData";
import { Link } from "react-router-dom";
import { useImoveis, useDeleteImovel } from "@/hooks/useImoveis";
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

type SortKey = "nome" | "areaHa" | "progresso" | "matricula" | "prazo";

export default function Imoveis() {
  const { favoritos, toggleFavorito } = useGeoStore();
  const { data: imoveis = [], isLoading, isError, error, refetch, isFetching } = useImoveis();
  const deleteMut = useDeleteImovel();

  const [q, setQ] = useState("");
  const [matricula, setMatricula] = useState("");
  const [mun, setMun] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [resp, setResp] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("nome");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showFavOnly, setShowFavOnly] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Imovel | null>(null);
  const [toDelete, setToDelete] = useState<Imovel | null>(null);

  const municipios = Array.from(
    new Set(imoveis.map((i) => `${i.municipio}/${i.estado}`))
  );

  const filtered = useMemo(() => {
    const list = imoveis.filter((i) => {
      const matchQ =
        !q ||
        i.nome.toLowerCase().includes(q.toLowerCase()) ||
        i.proprietarioNome?.toLowerCase().includes(q.toLowerCase()) ||
        i.codigoIncra?.toLowerCase().includes(q.toLowerCase());
      const matchMat = !matricula || i.matricula?.includes(matricula);
      const matchM = mun === "all" || `${i.municipio}/${i.estado}` === mun;
      const matchS = status === "all" || i.status === status;
      const matchR = resp === "all" || i.responsavelTecnico === resp;
      const matchFav = !showFavOnly || favoritos.includes(i.id);
      return matchQ && matchMat && matchM && matchS && matchR && matchFav;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sort === "areaHa" || sort === "progresso") return (a[sort] - b[sort]) * dir;
      if (sort === "prazo") return (slaInfo(a).dias - slaInfo(b).dias) * dir;
      return String(a[sort]).localeCompare(String(b[sort])) * dir;
    });
  }, [imoveis, q, matricula, mun, status, resp, sort, sortDir, showFavOnly, favoritos]);

  function toggleSort(k: SortKey) {
    if (sort === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSort(k);
      setSortDir("asc");
    }
  }

  function handleNovo() {
    setEditing(null);
    setFormOpen(true);
  }

  function handleEditar(i: Imovel, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditing(i);
    setFormOpen(true);
  }

  function handleExcluir(i: Imovel, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setToDelete(i);
  }

  async function confirmarExclusao() {
    if (!toDelete) return;
    await deleteMut.mutateAsync(toDelete.id);
    setToDelete(null);
  }

  function exportarCSV() {
    const header = [
      "nome",
      "matricula",
      "codigoIncra",
      "municipio",
      "uf",
      "areaHa",
      "proprietario",
      "responsavel",
      "status",
      "progresso",
    ];
    const rows = filtered.map((i) => [
      i.nome,
      i.matricula,
      i.codigoIncra,
      i.municipio,
      i.estado,
      i.areaHa,
      i.proprietarioNome,
      i.responsavelTecnico,
      i.status,
      `${i.progresso}%`,
    ]);
    const csv = [header, ...rows].map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `imoveis-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const vencidos = imoveis.filter((i) => slaInfo(i).vencido).length;
  const proximos = imoveis.filter((i) => slaInfo(i).proximo).length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        breadcrumb="Cadastros"
        title="Imóveis Rurais"
        subtitle={
          isLoading
            ? "Carregando do backend..."
            : `${filtered.length} de ${imoveis.length} imóveis · ${vencidos} com prazo vencido · ${proximos} próximos do prazo`
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />{" "}
              Atualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={exportarCSV}
              disabled={filtered.length === 0}
            >
              <Download className="w-4 h-4" /> Exportar CSV
            </Button>
            <Button size="sm" className="gap-2" onClick={handleNovo}>
              <Plus className="w-4 h-4" /> Novo imóvel
            </Button>
          </>
        }
      />

      {isError && (
        <Card className="p-4 mb-4 border-destructive/40 bg-destructive/5 text-sm text-destructive">
          Falha ao carregar imóveis: {(error as Error).message}
        </Card>
      )}

      <Card className="p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Nome, proprietário ou código INCRA..."
              className="pl-10"
            />
          </div>
          <div className="md:col-span-2">
            <Input
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              placeholder="Matrícula"
              className="font-mono text-xs"
            />
          </div>
          <Select value={mun} onValueChange={setMun}>
            <SelectTrigger className="md:col-span-2">
              <SelectValue placeholder="Município" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos municípios</SelectItem>
              {municipios.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={resp} onValueChange={setResp}>
            <SelectTrigger className="md:col-span-2">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos resp.</SelectItem>
              {responsaveisUnicos.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="md:col-span-2">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              {(Object.keys(STATUS_LABEL) as ProcessStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs">
          <button
            onClick={() => setShowFavOnly(!showFavOnly)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
              showFavOnly
                ? "bg-warning/10 text-warning border-warning/40"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Star className={`w-3 h-3 ${showFavOnly ? "fill-warning" : ""}`} /> Favoritos{" "}
            {showFavOnly && `(${filtered.length})`}
          </button>
          {(q ||
            matricula ||
            mun !== "all" ||
            status !== "all" ||
            resp !== "all" ||
            showFavOnly) && (
            <button
              onClick={() => {
                setQ("");
                setMatricula("");
                setMun("all");
                setStatus("all");
                setResp("all");
                setShowFavOnly(false);
              }}
              className="text-muted-foreground hover:text-foreground underline"
            >
              limpar filtros
            </button>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2.5 w-10"></th>
                <th className="text-left px-3 py-2.5">
                  <SortHead label="Imóvel" k="nome" sort={sort} dir={sortDir} onClick={toggleSort} />
                </th>
                <th className="text-left px-3 py-2.5">
                  <SortHead label="Matrícula" k="matricula" sort={sort} dir={sortDir} onClick={toggleSort} />
                </th>
                <th className="text-left px-3 py-2.5">Município/UF</th>
                <th className="text-left px-3 py-2.5">Proprietário</th>
                <th className="text-right px-3 py-2.5">
                  <SortHead label="Área (ha)" k="areaHa" sort={sort} dir={sortDir} onClick={toggleSort} align="right" />
                </th>
                <th className="text-left px-3 py-2.5">Resp. Técnico</th>
                <th className="text-left px-3 py-2.5">Status</th>
                <th className="text-left px-3 py-2.5">
                  <SortHead label="Prazo" k="prazo" sort={sort} dir={sortDir} onClick={toggleSort} />
                </th>
                <th className="text-left px-3 py-2.5 w-24">
                  <SortHead label="Progresso" k="progresso" sort={sort} dir={sortDir} onClick={toggleSort} />
                </th>
                <th className="text-right px-3 py-2.5 w-20">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-sm text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Carregando
                    imóveis do backend...
                  </td>
                </tr>
              )}
              {!isLoading &&
                filtered.map((i) => {
                  const sla = slaInfo(i);
                  return (
                    <tr key={i.id} className="border-b border-border hover:bg-muted/40 transition-colors">
                      <td className="px-3 py-2.5">
                        <button onClick={() => toggleFavorito(i.id)}>
                          <Star
                            className={`w-4 h-4 ${
                              favoritos.includes(i.id)
                                ? "fill-warning text-warning"
                                : "text-muted-foreground/40"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-3 py-2.5">
                        <Link to={`/imoveis/${i.id}`} className="font-medium hover:text-primary">
                          {i.nome}
                        </Link>
                        <div className="text-[10px] text-muted-foreground font-mono">
                          {i.codigoIncra}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs">{i.matricula}</td>
                      <td className="px-3 py-2.5 text-xs">
                        {i.municipio}/{i.estado}
                      </td>
                      <td
                        className="px-3 py-2.5 text-xs truncate max-w-[180px]"
                        title={i.proprietarioNome}
                      >
                        {i.proprietarioNome}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-xs">
                        {i.areaHa?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">
                        {i.responsavelTecnico?.replace("Eng. ", "")}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={i.status} />
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                            sla.vencido
                              ? "text-destructive"
                              : sla.proximo
                              ? "text-warning"
                              : "text-muted-foreground"
                          }`}
                        >
                          {sla.vencido && <AlertTriangle className="w-3 h-3" />}
                          {sla.proximo && !sla.vencido && <Clock className="w-3 h-3" />}
                          {sla.rotulo}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-primary-glow"
                              style={{ width: `${i.progresso}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground w-7 text-right">
                            {i.progresso}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => handleEditar(i, e)}
                            title="Editar"
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleExcluir(i, e)}
                            title="Excluir"
                            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-sm text-muted-foreground">
                    Nenhum imóvel corresponde aos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ImovelFormDialog open={formOpen} onOpenChange={setFormOpen} imovel={editing} />

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir imóvel?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O imóvel{" "}
              <strong>{toDelete?.nome}</strong> (matrícula {toDelete?.matricula}) será removido
              do banco.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMut.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarExclusao}
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

function SortHead({
  label,
  k,
  sort,
  dir,
  onClick,
  align,
}: {
  label: string;
  k: SortKey;
  sort: SortKey;
  dir: "asc" | "desc";
  onClick: (k: SortKey) => void;
  align?: "right";
}) {
  const active = sort === k;
  return (
    <button
      onClick={() => onClick(k)}
      className={`inline-flex items-center gap-1 hover:text-foreground transition-colors ${
        align === "right" ? "ml-auto" : ""
      } ${active ? "text-foreground" : ""}`}
    >
      {label}
      <ArrowUpDown
        className={`w-3 h-3 ${active ? "opacity-100" : "opacity-30"} ${
          active && dir === "desc" ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}
