import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { rowToDocumento, rowToHistorico } from "@/services/mappers";

export const documentosKeys = {
  all: ["documentos"] as const,
  list: (imovelId?: string) => [...documentosKeys.all, "list", imovelId || "all"] as const,
};

export function useDocumentos(imovelId?: string) {
  return useQuery({
    queryKey: documentosKeys.list(imovelId),
    queryFn: async () => {
      let q = supabase.from("documentos").select("*").order("created_at", { ascending: false });
      if (imovelId) q = q.eq("imovel_id", imovelId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map(rowToDocumento);
    },
  });
}

export function useCreateDocumento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { nome: string; categoria?: string; tipo?: string; tamanho?: string; status?: string; imovelId?: string }) => {
      const { data: doc, error } = await supabase
        .from("documentos")
        .insert({
          nome: data.nome,
          categoria: data.categoria || "imovel",
          tipo: data.tipo || "PDF",
          tamanho: data.tamanho || "",
          status: data.status || "pendente",
          imovel_id: data.imovelId || null,
        })
        .select()
        .single();
      if (error) throw error;
      return rowToDocumento(doc);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentosKeys.all });
      toast.success("Documento adicionado");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteDocumento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentosKeys.all });
      toast.success("Documento excluído");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useHistorico(imovelId?: string) {
  return useQuery({
    queryKey: ["historico", imovelId || "all"],
    queryFn: async () => {
      let q = supabase.from("historico").select("*").order("data", { ascending: false });
      if (imovelId) q = q.eq("imovel_id", imovelId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []).map(rowToHistorico);
    },
    enabled: !!imovelId || imovelId === undefined,
  });
}
