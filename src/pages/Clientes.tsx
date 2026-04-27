import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Mail,
  Phone,
  MapPin,
  Building2,
  Pencil,
  Trash2,
  Search,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useClientes, useDeleteCliente } from "@/hooks/useClientes";
import { useImoveis } from "@/hooks/useImoveis";
import { ClienteFormDialog } from "@/components/forms/ClienteFormDialog";
import type { Cliente } from "@/data/mockData";
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

export default function Clientes() {
  const { data: clientes = [], isLoading, isError, error, refetch, isFetching } =
    useClientes();
  const { data: imoveis = [] } = useImoveis();
  const deleteMut = useDeleteCliente();

  const [q, setQ] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [toDelete, setToDelete] = useState<Cliente | null>(null);

  const filtered = useMemo(() => {
    if (!q) return clientes;
    const ql = q.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(ql) ||
        c.cpfCnpj?.includes(q) ||
        c.email?.toLowerCase().includes(ql) ||
        c.municipio?.toLowerCase().includes(ql)
    );
  }, [clientes, q]);

  function handleNovo() {
    setEditing(null);
    setFormOpen(true);
  }

  async function confirmarExclusao() {
    if (!toDelete) return;
    await deleteMut.mutateAsync(toDelete.id);
    setToDelete(null);
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        breadcrumb="Cadastros"
        title="Clientes & Proprietários"
        subtitle={
          isLoading
            ? "Carregando do backend..."
            : `${filtered.length} de ${clientes.length} cadastros`
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
            <Button size="sm" className="gap-2" onClick={handleNovo}>
              <Plus className="w-4 h-4" /> Novo cliente
            </Button>
          </>
        }
      />

      {isError && (
        <Card className="p-4 mb-4 border-destructive/40 bg-destructive/5 text-sm text-destructive">
          Falha ao carregar clientes: {(error as Error).message}
        </Card>
      )}

      <Card className="p-4 mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, CPF/CNPJ, e-mail ou município..."
            className="pl-10"
          />
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Carregando clientes...
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground text-sm">
          Nenhum cliente encontrado.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const seusImoveis = imoveis.filter((i) => i.proprietarioId === c.id);
            const totalHa = seusImoveis.reduce((s, i) => s + i.areaHa, 0);
            const isPJ = (c.cpfCnpj || "").length > 14;
            return (
              <Card
                key={c.id}
                className="p-5 hover:shadow-elevated transition-shadow group relative"
              >
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() => {
                      setEditing(c);
                      setFormOpen(true);
                    }}
                    title="Editar"
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setToDelete(c)}
                    title="Excluir"
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`w-11 h-11 rounded-md flex items-center justify-center shrink-0 ${
                      isPJ
                        ? "bg-secondary/15 text-secondary"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    {isPJ ? (
                      <Building2 className="w-5 h-5" />
                    ) : (
                      <span className="font-display font-bold">
                        {c.nome
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm leading-tight pr-16">
                      {c.nome}
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      {c.cpfCnpj}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3" /> {c.telefone || "—"}
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3 h-3" /> {c.email || "—"}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> {c.municipio}/{c.estado}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Imóveis
                    </div>
                    <div className="font-display font-bold text-lg">
                      {seusImoveis.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Área total
                    </div>
                    <div className="font-display font-bold text-lg">
                      {totalHa.toFixed(0)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">ha</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ClienteFormDialog open={formOpen} onOpenChange={setFormOpen} cliente={editing} />

      <AlertDialog open={!!toDelete} onOpenChange={(v) => !v && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. <strong>{toDelete?.nome}</strong> será removido
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
