import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { imoveisApi, type ImovelInput } from "@/services/api";
import type { Imovel, ProcessStatus } from "@/data/mockData";

export const imoveisKeys = {
  all: ["imoveis"] as const,
  list: () => [...imoveisKeys.all, "list"] as const,
  detail: (id: string) => [...imoveisKeys.all, "detail", id] as const,
};

export function useImoveis() {
  return useQuery({
    queryKey: imoveisKeys.list(),
    queryFn: () => imoveisApi.list(),
  });
}

export function useImovel(id: string | undefined) {
  return useQuery({
    queryKey: imoveisKeys.detail(id || ""),
    queryFn: () => imoveisApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateImovel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ImovelInput) => imoveisApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: imoveisKeys.all });
      toast.success("Imóvel criado com sucesso");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateImovel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ImovelInput }) =>
      imoveisApi.update(id, data),
    onSuccess: (im: Imovel) => {
      qc.invalidateQueries({ queryKey: imoveisKeys.all });
      qc.invalidateQueries({ queryKey: imoveisKeys.detail(im.id) });
      toast.success("Imóvel atualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteImovel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => imoveisApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: imoveisKeys.all });
      toast.success("Imóvel excluído");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateImovelStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProcessStatus }) =>
      imoveisApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: imoveisKeys.all }),
    onError: (e: Error) => toast.error(e.message),
  });
}
