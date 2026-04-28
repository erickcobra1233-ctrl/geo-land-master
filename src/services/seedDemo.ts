// Cria dados de demonstração no banco a partir do mockData (clientes, imóveis, pontos, documentos, histórico).
// Usado no botão "Popular dados de exemplo" do Dashboard quando o sistema está vazio.
import { supabase } from "@/integrations/supabase/client";
import { clientes as mockClientes, imoveis as mockImoveis, pontos as mockPontos, documentos as mockDocumentos, historico as mockHistorico } from "@/data/mockData";
import { clienteToRow, imovelToRow, pontoToRow } from "@/services/mappers";

export async function seedDemoData(): Promise<{
  clientes: number; imoveis: number; pontos: number; documentos: number; historico: number;
}> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData.user?.id || null;
  const userName = (userData.user?.user_metadata?.nome as string) || userData.user?.email || "Usuário";
  // 1) Clientes — guardamos o mapping mockId -> uuid real
  const clientesIds: Record<string, string> = {};
  for (const c of mockClientes) {
    const { data, error } = await supabase
      .from("clientes")
      .insert({ ...clienteToRow(c), created_by: uid } as any)
      .select("id")
      .single();
    if (error) throw new Error(`Cliente "${c.nome}": ${error.message}`);
    clientesIds[c.id] = data.id;
  }

  // 2) Imóveis — substituímos proprietarioId pelo uuid do cliente real
  const imoveisIds: Record<string, string> = {};
  for (const im of mockImoveis) {
    const proprietarioId = clientesIds[im.proprietarioId] || null;
    const row = { ...imovelToRow({ ...im, proprietarioId: proprietarioId || undefined }), created_by: uid } as any;
    const { data, error } = await supabase.from("imoveis").insert(row).select("id").single();
    if (error) throw new Error(`Imóvel "${im.nome}": ${error.message}`);
    imoveisIds[im.id] = data.id;
  }

  // 3) Pontos — vincular ao novo imovelId
  for (const p of mockPontos) {
    const row = { ...pontoToRow({ ...p, imovelId: p.imovelId ? imoveisIds[p.imovelId] : undefined }), created_by: uid } as any;
    const { error } = await supabase.from("pontos").insert(row);
    if (error) throw new Error(`Ponto "${p.codigo}": ${error.message}`);
  }

  // 4) Documentos
  for (const d of mockDocumentos) {
    const { error } = await supabase.from("documentos").insert({
      nome: d.nome,
      categoria: d.categoria,
      tipo: d.tipo,
      tamanho: d.tamanho,
      status: d.status,
      data: d.data,
      imovel_id: d.imovelId ? imoveisIds[d.imovelId] : null,
      created_by: uid,
    } as any);
    if (error) throw new Error(`Documento "${d.nome}": ${error.message}`);
  }

  // 5) Histórico
  for (const h of mockHistorico) {
    const novoImovelId = imoveisIds[h.imovelId];
    if (!novoImovelId) continue;
    const { error } = await supabase.from("historico").insert({
      imovel_id: novoImovelId,
      data: h.data,
      usuario: userName,
      acao: h.acao,
      obs: h.obs ?? null,
      created_by: uid,
    } as any);
    if (error) throw new Error(`Histórico: ${error.message}`);
  }

  return {
    clientes: mockClientes.length,
    imoveis: mockImoveis.length,
    pontos: mockPontos.length,
    documentos: mockDocumentos.length,
    historico: mockHistorico.length,
  };
}
