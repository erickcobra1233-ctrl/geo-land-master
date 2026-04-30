import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { rowToPonto, pontoToRow } from "@/services/mappers";
import type { Ponto } from "@/data/mockData";

export const pontosKeys = {
  all: ["pontos"] as const,
  list: () => [...pontosKeys.all, "list"] as const,
};

export function usePontos() {
  return useQuery({
    queryKey: pontosKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase.from("pontos").select("*").order("codigo");
      if (error) throw error;
      return (data || []).map(rowToPonto);
    },
  });
}

export function useCreatePonto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Ponto>) => {
      const row: any = pontoToRow(data);
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.id) row.created_by = userData.user.id;
      const { data: p, error } = await supabase.from("pontos").insert(row).select().single();
      if (error) throw error;
      return rowToPonto(p);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pontosKeys.all });
      toast.success("Ponto criado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreatePontosBulk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (lista: Partial<Ponto>[]) => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      const rows = lista.map((p) => {
        const r: any = pontoToRow(p);
        if (uid) r.created_by = uid;
        return r;
      });
      const { data, error } = await supabase.from("pontos").insert(rows).select();
      if (error) throw error;
      return (data || []).map(rowToPonto);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: pontosKeys.all });
      toast.success(`${data.length} pontos importados`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePonto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pontos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pontosKeys.all });
      toast.success("Ponto excluído");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
