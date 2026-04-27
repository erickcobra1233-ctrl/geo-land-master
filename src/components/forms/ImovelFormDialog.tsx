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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  STATUS_LABEL,
  type Imovel,
  type ProcessStatus,
} from "@/data/mockData";
import { useCreateImovel, useUpdateImovel } from "@/hooks/useImoveis";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  imovel?: Imovel | null; // se vier, é edição
}

const empty = {
  nome: "",
  matricula: "",
  codigoIncra: "",
  ccir: "",
  municipio: "",
  comarca: "",
  estado: "",
  areaHa: 0,
  proprietarioNome: "",
  cpfCnpj: "",
  situacao: "Em andamento",
  responsavelTecnico: "",
  status: "campo" as ProcessStatus,
  progresso: 0,
  dataInicio: new Date().toISOString().slice(0, 10),
  dataPrevisao: new Date(Date.now() + 60 * 86400_000).toISOString().slice(0, 10),
  obs: "",
};

export function ImovelFormDialog({ open, onOpenChange, imovel }: Props) {
  const isEdit = !!imovel;
  const [form, setForm] = useState(empty);
  const create = useCreateImovel();
  const update = useUpdateImovel();
  const saving = create.isPending || update.isPending;

  useEffect(() => {
    if (imovel) {
      setForm({
        nome: imovel.nome,
        matricula: imovel.matricula,
        codigoIncra: imovel.codigoIncra,
        ccir: imovel.ccir,
        municipio: imovel.municipio,
        comarca: imovel.comarca,
        estado: imovel.estado,
        areaHa: imovel.areaHa,
        proprietarioNome: imovel.proprietarioNome,
        cpfCnpj: imovel.cpfCnpj,
        situacao: imovel.situacao,
        responsavelTecnico: imovel.responsavelTecnico,
        status: imovel.status,
        progresso: imovel.progresso,
        dataInicio: imovel.dataInicio?.slice(0, 10) || empty.dataInicio,
        dataPrevisao: imovel.dataPrevisao?.slice(0, 10) || empty.dataPrevisao,
        obs: imovel.obs || "",
      });
    } else if (open) {
      setForm(empty);
    }
  }, [imovel, open]);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.matricula) return;
    if (isEdit && imovel) {
      await update.mutateAsync({ id: imovel.id, data: form });
    } else {
      await create.mutateAsync(form);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar imóvel" : "Novo imóvel"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Atualize os dados cadastrais do imóvel."
              : "Preencha os dados do novo imóvel rural."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome do imóvel *" className="md:col-span-2">
            <Input
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
              required
            />
          </Field>
          <Field label="Matrícula *">
            <Input
              value={form.matricula}
              onChange={(e) => set("matricula", e.target.value)}
              required
              className="font-mono"
            />
          </Field>
          <Field label="Código INCRA / SNCR">
            <Input
              value={form.codigoIncra}
              onChange={(e) => set("codigoIncra", e.target.value)}
              className="font-mono"
            />
          </Field>
          <Field label="CCIR">
            <Input value={form.ccir} onChange={(e) => set("ccir", e.target.value)} />
          </Field>
          <Field label="Área (ha)">
            <Input
              type="number"
              step="0.01"
              value={form.areaHa}
              onChange={(e) => set("areaHa", Number(e.target.value))}
            />
          </Field>
          <Field label="Município">
            <Input
              value={form.municipio}
              onChange={(e) => set("municipio", e.target.value)}
            />
          </Field>
          <Field label="Comarca">
            <Input
              value={form.comarca}
              onChange={(e) => set("comarca", e.target.value)}
            />
          </Field>
          <Field label="UF">
            <Input
              value={form.estado}
              onChange={(e) => set("estado", e.target.value.toUpperCase())}
              maxLength={2}
            />
          </Field>
          <Field label="Proprietário">
            <Input
              value={form.proprietarioNome}
              onChange={(e) => set("proprietarioNome", e.target.value)}
            />
          </Field>
          <Field label="CPF / CNPJ">
            <Input
              value={form.cpfCnpj}
              onChange={(e) => set("cpfCnpj", e.target.value)}
              className="font-mono"
            />
          </Field>
          <Field label="Responsável técnico">
            <Input
              value={form.responsavelTecnico}
              onChange={(e) => set("responsavelTecnico", e.target.value)}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(v) => set("status", v as ProcessStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABEL) as ProcessStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Progresso (%)">
            <Input
              type="number"
              min={0}
              max={100}
              value={form.progresso}
              onChange={(e) => set("progresso", Number(e.target.value))}
            />
          </Field>
          <Field label="Data de início">
            <Input
              type="date"
              value={form.dataInicio}
              onChange={(e) => set("dataInicio", e.target.value)}
            />
          </Field>
          <Field label="Previsão de conclusão">
            <Input
              type="date"
              value={form.dataPrevisao}
              onChange={(e) => set("dataPrevisao", e.target.value)}
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
              {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar imóvel"}
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
