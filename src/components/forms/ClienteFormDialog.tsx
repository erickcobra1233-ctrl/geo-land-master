import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCliente, useUpdateCliente } from "@/hooks/useClientes";
import type { Cliente } from "@/data/mockData";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cliente?: Cliente | null;
}

const empty = {
  nome: "",
  cpfCnpj: "",
  telefone: "",
  email: "",
  endereco: "",
  municipio: "",
  estado: "",
  obs: "",
};

export function ClienteFormDialog({ open, onOpenChange, cliente }: Props) {
  const isEdit = !!cliente;
  const [form, setForm] = useState(empty);
  const create = useCreateCliente();
  const update = useUpdateCliente();
  const saving = create.isPending || update.isPending;

  useEffect(() => {
    if (cliente) {
      setForm({
        nome: cliente.nome,
        cpfCnpj: cliente.cpfCnpj,
        telefone: cliente.telefone,
        email: cliente.email,
        endereco: cliente.endereco,
        municipio: cliente.municipio,
        estado: cliente.estado,
        obs: cliente.obs || "",
      });
    } else if (open) {
      setForm(empty);
    }
  }, [cliente, open]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome) return;
    if (isEdit && cliente) {
      await update.mutateAsync({ id: cliente.id, data: form });
    } else {
      await create.mutateAsync(form);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar cliente" : "Novo cliente"}</DialogTitle>
          <DialogDescription>
            Cadastro de proprietário ou pessoa jurídica.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome / Razão social *" className="md:col-span-2">
            <Input
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              required
            />
          </Field>
          <Field label="CPF / CNPJ">
            <Input
              value={form.cpfCnpj}
              onChange={(e) => set("cpfCnpj", e.target.value)}
              className="font-mono"
            />
          </Field>
          <Field label="Telefone">
            <Input
              value={form.telefone}
              onChange={(e) => set("telefone", e.target.value)}
            />
          </Field>
          <Field label="E-mail" className="md:col-span-2">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Endereço" className="md:col-span-2">
            <Input
              value={form.endereco}
              onChange={(e) => set("endereco", e.target.value)}
            />
          </Field>
          <Field label="Município">
            <Input
              value={form.municipio}
              onChange={(e) => set("municipio", e.target.value)}
            />
          </Field>
          <Field label="UF">
            <Input
              value={form.estado}
              onChange={(e) => set("estado", e.target.value.toUpperCase())}
              maxLength={2}
            />
          </Field>
          <Field label="Observações" className="md:col-span-2">
            <Textarea
              value={form.obs}
              onChange={(e) => set("obs", e.target.value)}
              rows={3}
            />
          </Field>

          <DialogFooter className="md:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
