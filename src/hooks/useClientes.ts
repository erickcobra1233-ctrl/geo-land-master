import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientesApi, type ClienteInput } from "@/services/api";
import type { Cliente } from "@/data/mockData";

export const clientesKeys = {
  all: ["clientes"] as const,
  list: () => [...clientesKeys.all, "list"] as const,
  detail: (id: string) => [...clientesKeys.all, "detail", id] as const,
};

export function useClientes() {
  return useQuery({
    queryKey: clientesKeys.list(),
    queryFn: () => clientesApi.list(),
  });
}

export function useCliente(id: string | undefined) {
  return useQuery({
    queryKey: clientesKeys.detail(id || ""),
    queryFn: () => clientesApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ClienteInput) => clientesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientesKeys.all });
      toast.success("Cliente criado com sucesso");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClienteInput }) =>
      clientesApi.update(id, data),
    onSuccess: (c: Cliente) => {
      qc.invalidateQueries({ queryKey: clientesKeys.all });
      qc.invalidateQueries({ queryKey: clientesKeys.detail(c.id) });
      toast.success("Cliente atualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientesKeys.all });
      toast.success("Cliente excluído");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
