import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { rowToCliente, clienteToRow } from "@/services/mappers";
import type { Cliente } from "@/data/mockData";

export const clientesKeys = {
  all: ["clientes"] as const,
  list: () => [...clientesKeys.all, "list"] as const,
  detail: (id: string) => [...clientesKeys.all, "detail", id] as const,
};

export function useClientes() {
  return useQuery({
    queryKey: clientesKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*, imoveis(id)")
        .order("nome");
      if (error) throw error;
      return (data || []).map((r: any) => ({
        ...rowToCliente(r),
        imoveisIds: (r.imoveis || []).map((x: any) => x.id),
      }));
    },
  });
}

export function useCreateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Cliente>) => {
      const { data: c, error } = await supabase.from("clientes").insert(clienteToRow(data)).select().single();
      if (error) throw error;
      return rowToCliente(c);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientesKeys.all });
      toast.success("Cliente criado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Cliente> }) => {
      const { data: c, error } = await supabase.from("clientes").update(clienteToRow(data)).eq("id", id).select().single();
      if (error) throw error;
      return rowToCliente(c);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientesKeys.all });
      toast.success("Cliente atualizado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clientes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: clientesKeys.all });
      toast.success("Cliente excluído");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
