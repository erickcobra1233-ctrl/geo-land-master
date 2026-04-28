import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { rowToImovel, imovelToRow } from "@/services/mappers";
import type { Imovel, ProcessStatus } from "@/data/mockData";

type ImovelRow = any;

export const imoveisKeys = {
  all: ["imoveis"] as const,
  list: () => [...imoveisKeys.all, "list"] as const,
  detail: (id: string) => [...imoveisKeys.all, "detail", id] as const,
};

export function useImoveis() {
  return useQuery({
    queryKey: imoveisKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("imoveis")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(rowToImovel);
    },
  });
}

export function useImovel(id: string | undefined) {
  return useQuery({
    queryKey: imoveisKeys.detail(id || ""),
    queryFn: async () => {
      const { data, error } = await supabase.from("imoveis").select("*").eq("id", id!).single();
      if (error) throw error;
      return rowToImovel(data);
    },
    enabled: !!id,
  });
}

export function useCreateImovel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Imovel>) => {
      const row = imovelToRow(data) as ImovelRow;
      const { data: created, error } = await supabase.from("imoveis").insert(row).select().single();
      if (error) throw error;
      return rowToImovel(created);
    },
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<Imovel> }) => {
      const row = imovelToRow(data) as ImovelRow;
      const { data: updated, error } = await supabase
        .from("imoveis")
        .update(row)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return rowToImovel(updated);
    },
    onSuccess: (im) => {
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
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("imoveis").delete().eq("id", id);
      if (error) throw error;
    },
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
    mutationFn: async ({ id, status }: { id: string; status: ProcessStatus }) => {
      const { error } = await supabase.from("imoveis").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: imoveisKeys.all }),
    onError: (e: Error) => toast.error(e.message),
  });
}
