// Conversores entre rows do banco (snake_case) e tipos TS do frontend (camelCase).
import type { Cliente, Imovel, Ponto, Documento, HistoricoEntry, ProcessStatus, Vertex, Confrontante } from "@/data/mockData";

// ───────────── Clientes ─────────────
export function rowToCliente(r: any): Cliente {
  return {
    id: r.id,
    nome: r.nome ?? "",
    cpfCnpj: r.cpf_cnpj ?? "",
    telefone: r.telefone ?? "",
    email: r.email ?? "",
    endereco: r.endereco ?? "",
    municipio: r.municipio ?? "",
    estado: r.estado ?? "",
    obs: r.obs ?? undefined,
    imoveisIds: [],
  };
}
export function clienteToRow(c: Partial<Cliente>) {
  return {
    nome: c.nome,
    cpf_cnpj: c.cpfCnpj,
    telefone: c.telefone,
    email: c.email,
    endereco: c.endereco,
    municipio: c.municipio,
    estado: c.estado,
    obs: c.obs ?? null,
  };
}

// ───────────── Imóveis ─────────────
export function rowToImovel(r: any): Imovel {
  const centro: [number, number] = [Number(r.centro_lat ?? -15), Number(r.centro_lng ?? -55)];
  return {
    id: r.id,
    nome: r.nome ?? "",
    matricula: r.matricula ?? "",
    codigoIncra: r.codigo_incra ?? "",
    ccir: r.ccir ?? "",
    municipio: r.municipio ?? "",
    comarca: r.comarca ?? "",
    estado: r.estado ?? "",
    areaHa: Number(r.area_ha ?? 0),
    areaM2: Number(r.area_m2 ?? 0),
    proprietarioId: r.cliente_id ?? "",
    proprietarioNome: r.proprietario_nome ?? "",
    cpfCnpj: r.cpf_cnpj ?? "",
    conjuge: r.conjuge ?? undefined,
    cpfConjuge: r.cpf_conjuge ?? undefined,
    situacao: r.situacao ?? "Em andamento",
    obs: r.obs ?? undefined,
    dataInicio: r.data_inicio ?? new Date().toISOString().slice(0, 10),
    dataPrevisao: r.data_previsao ?? new Date().toISOString().slice(0, 10),
    responsavelTecnico: r.responsavel_tecnico ?? "",
    equipeCampo: Array.isArray(r.equipe_campo) ? r.equipe_campo : [],
    status: (r.status ?? "campo") as ProcessStatus,
    progresso: Number(r.progresso ?? 0),
    centro,
    poligono: Array.isArray(r.poligono) ? (r.poligono as [number, number][]) : [],
    vertices: Array.isArray(r.vertices) ? (r.vertices as Vertex[]) : [],
    confrontantes: Array.isArray(r.confrontantes) ? (r.confrontantes as Confrontante[]) : [],
    notasInternas: r.notas_internas ?? undefined,
  };
}
export function imovelToRow(i: Partial<Imovel>) {
  const row: Record<string, unknown> = {};
  if (i.nome !== undefined) row.nome = i.nome;
  if (i.matricula !== undefined) row.matricula = i.matricula;
  if (i.codigoIncra !== undefined) row.codigo_incra = i.codigoIncra;
  if (i.ccir !== undefined) row.ccir = i.ccir;
  if (i.municipio !== undefined) row.municipio = i.municipio;
  if (i.comarca !== undefined) row.comarca = i.comarca;
  if (i.estado !== undefined) row.estado = i.estado;
  if (i.areaHa !== undefined) {
    row.area_ha = i.areaHa;
    row.area_m2 = Math.round((i.areaHa || 0) * 10000);
  }
  if (i.proprietarioId !== undefined) row.cliente_id = i.proprietarioId || null;
  if (i.proprietarioNome !== undefined) row.proprietario_nome = i.proprietarioNome;
  if (i.cpfCnpj !== undefined) row.cpf_cnpj = i.cpfCnpj;
  if (i.situacao !== undefined) row.situacao = i.situacao;
  if (i.obs !== undefined) row.obs = i.obs;
  if (i.dataInicio !== undefined) row.data_inicio = i.dataInicio;
  if (i.dataPrevisao !== undefined) row.data_previsao = i.dataPrevisao;
  if (i.responsavelTecnico !== undefined) row.responsavel_tecnico = i.responsavelTecnico;
  if (i.equipeCampo !== undefined) row.equipe_campo = i.equipeCampo;
  if (i.status !== undefined) row.status = i.status;
  if (i.progresso !== undefined) row.progresso = i.progresso;
  if (i.centro !== undefined) {
    row.centro_lat = i.centro[0];
    row.centro_lng = i.centro[1];
  }
  if (i.poligono !== undefined) row.poligono = i.poligono;
  if (i.vertices !== undefined) row.vertices = i.vertices;
  if (i.confrontantes !== undefined) row.confrontantes = i.confrontantes;
  if (i.notasInternas !== undefined) row.notas_internas = i.notasInternas;
  return row;
}

// ───────────── Pontos ─────────────
export function rowToPonto(r: any): Ponto {
  return {
    id: r.id,
    codigo: r.codigo ?? "",
    nome: r.nome ?? "",
    tipo: (r.tipo ?? "Marco") as Ponto["tipo"],
    categoria: r.categoria ?? "",
    descricao: r.descricao ?? "",
    leste: Number(r.leste ?? 0),
    norte: Number(r.norte ?? 0),
    latitude: Number(r.latitude ?? 0),
    longitude: Number(r.longitude ?? 0),
    altitude: Number(r.altitude ?? 0),
    sistema: r.sistema ?? "",
    datum: r.datum ?? "",
    precisaoH: Number(r.precisao_h ?? 0),
    precisaoV: Number(r.precisao_v ?? 0),
    metodo: r.metodo ?? "",
    equipamento: r.equipamento ?? "",
    data: r.data ?? "",
    operador: r.operador ?? "",
    imovelId: r.imovel_id ?? undefined,
    municipio: r.municipio ?? "",
    obs: r.obs ?? undefined,
  };
}
export function pontoToRow(p: Partial<Ponto>) {
  return {
    codigo: p.codigo,
    nome: p.nome,
    tipo: p.tipo,
    categoria: p.categoria,
    descricao: p.descricao,
    leste: p.leste,
    norte: p.norte,
    latitude: p.latitude,
    longitude: p.longitude,
    altitude: p.altitude,
    sistema: p.sistema,
    datum: p.datum,
    precisao_h: p.precisaoH,
    precisao_v: p.precisaoV,
    metodo: p.metodo,
    equipamento: p.equipamento,
    data: p.data || null,
    operador: p.operador,
    imovel_id: p.imovelId || null,
    municipio: p.municipio,
    obs: p.obs ?? null,
  };
}

// ───────────── Documentos / Histórico ─────────────
export function rowToDocumento(r: any): Documento {
  return {
    id: r.id,
    nome: r.nome ?? "",
    categoria: (r.categoria ?? "imovel") as Documento["categoria"],
    tipo: r.tipo ?? "PDF",
    tamanho: r.tamanho ?? "",
    data: r.data ?? "",
    status: (r.status ?? "pendente") as Documento["status"],
    imovelId: r.imovel_id ?? undefined,
  };
}
export function rowToHistorico(r: any): HistoricoEntry {
  return {
    id: r.id,
    imovelId: r.imovel_id,
    data: r.data,
    usuario: r.usuario ?? "",
    acao: r.acao ?? "",
    obs: r.obs ?? undefined,
  };
}
