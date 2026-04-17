// GeoSIGEF Manager — Mock data realista (BR)
export type ProcessStatus =
  | "campo"
  | "processamento"
  | "conferencia"
  | "documentacao"
  | "sigef"
  | "cartorio"
  | "concluido"
  | "pendente";

export const STATUS_LABEL: Record<ProcessStatus, string> = {
  campo: "Levantamento de Campo",
  processamento: "Processamento",
  conferencia: "Conferência",
  documentacao: "Documentação",
  sigef: "SIGEF",
  cartorio: "Cartório",
  concluido: "Concluído",
  pendente: "Pendente",
};

export const STATUS_COLOR: Record<ProcessStatus, string> = {
  campo: "bg-status-campo/15 text-status-campo border-status-campo/30",
  processamento: "bg-status-processamento/15 text-status-processamento border-status-processamento/30",
  conferencia: "bg-status-conferencia/15 text-status-conferencia border-status-conferencia/30",
  documentacao: "bg-status-documentacao/15 text-status-documentacao border-status-documentacao/30",
  sigef: "bg-status-sigef/15 text-status-sigef border-status-sigef/30",
  cartorio: "bg-status-cartorio/15 text-status-cartorio border-status-cartorio/30",
  concluido: "bg-status-concluido/15 text-status-concluido border-status-concluido/30",
  pendente: "bg-status-pendente/15 text-status-pendente border-status-pendente/30",
};

export interface Vertex {
  id: string;
  codigo: string;
  tipo: "M" | "P" | "V" | "O"; // Marco, Ponto, Virtual, Outro
  leste: number;
  norte: number;
  latitude: number;
  longitude: number;
  altitude: number;
  datum: string;
  sistema: string;
  metodo: string;
  precisao: number;
  data: string;
  obs?: string;
}

export interface Confrontante {
  id: string;
  nome: string;
  tipoDivisa: "Cerca" | "Estrada" | "Rio" | "Córrego" | "Vala" | "Linha Seca";
  lado: string;
  documento?: string;
  obs?: string;
}

export interface Documento {
  id: string;
  nome: string;
  categoria: "imovel" | "pessoal" | "tecnico" | "campo" | "cartorio" | "sigef";
  tipo: string; // PDF, KML, etc
  tamanho: string;
  data: string;
  status: "conferido" | "pendente" | "enviado";
  imovelId?: string;
}

export interface Imovel {
  id: string;
  nome: string;
  matricula: string;
  codigoIncra: string;
  ccir: string;
  municipio: string;
  comarca: string;
  estado: string;
  areaHa: number;
  areaM2: number;
  proprietarioId: string;
  proprietarioNome: string;
  cpfCnpj: string;
  conjuge?: string;
  cpfConjuge?: string;
  situacao: string;
  obs?: string;
  dataInicio: string;
  dataPrevisao: string;
  responsavelTecnico: string;
  equipeCampo: string[];
  status: ProcessStatus;
  progresso: number;
  centro: [number, number]; // [lat, lng]
  poligono: [number, number][]; // [[lat, lng], ...]
  vertices: Vertex[];
  confrontantes: Confrontante[];
  notasInternas?: string;
}

export interface Ponto {
  id: string;
  codigo: string;
  nome: string;
  tipo: "Marco" | "Apoio" | "Levantamento" | "Referência" | "Auxiliar";
  categoria: string;
  descricao: string;
  leste: number;
  norte: number;
  latitude: number;
  longitude: number;
  altitude: number;
  sistema: string;
  datum: string;
  precisaoH: number;
  precisaoV: number;
  metodo: string;
  equipamento: string;
  data: string;
  operador: string;
  imovelId?: string;
  municipio: string;
  obs?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  municipio: string;
  estado: string;
  obs?: string;
  imoveisIds: string[];
}

export interface HistoricoEntry {
  id: string;
  imovelId: string;
  data: string;
  usuario: string;
  acao: string;
  obs?: string;
}

// ───────────────── seed helpers ─────────────────
const rt = ["Eng. Carlos Mendes", "Eng. Patrícia Oliveira", "Eng. Rodrigo Almeida", "Eng. Juliana Castro"];
const eq = ["Téc. Bruno", "Téc. Felipe", "Téc. Marcos", "Téc. Renata", "Téc. André"];

// Polígono retangular aproximado em torno de um centro (em graus)
function poligonoAo(redor: [number, number], wKm: number, hKm: number): [number, number][] {
  const [lat, lng] = redor;
  const dLat = hKm / 110.574;
  const dLng = wKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  return [
    [lat + dLat / 2, lng - dLng / 2],
    [lat + dLat / 2, lng + dLng / 2],
    [lat - dLat / 2, lng + dLng / 2 + dLng * 0.05],
    [lat - dLat / 2 - dLat * 0.08, lng - dLng / 2 + dLng * 0.02],
    [lat + dLat / 2, lng - dLng / 2],
  ];
}

function gerarVertices(poligono: [number, number][], inicio = 1): Vertex[] {
  return poligono.slice(0, -1).map((p, i) => ({
    id: `v-${inicio + i}-${Math.random().toString(36).slice(2, 6)}`,
    codigo: `M-${String(inicio + i).padStart(4, "0")}`,
    tipo: i === 0 ? "M" : i % 3 === 0 ? "V" : "P",
    leste: 450000 + Math.floor(Math.random() * 50000),
    norte: 8200000 + Math.floor(Math.random() * 100000),
    latitude: p[0],
    longitude: p[1],
    altitude: 380 + Math.random() * 200,
    datum: "SIRGAS 2000",
    sistema: "UTM 22S",
    metodo: i % 2 ? "GNSS RTK" : "GNSS Estático",
    precisao: 0.05 + Math.random() * 0.15,
    data: "2024-08-12",
  }));
}

// ───────────────── Clientes ─────────────────
export const clientes: Cliente[] = [
  { id: "c1", nome: "Fazenda Boa Vista Agropecuária Ltda", cpfCnpj: "12.345.678/0001-90", telefone: "(65) 99812-4455", email: "contato@fazendaboavista.com.br", endereco: "Rod. MT-358, Km 42", municipio: "Sorriso", estado: "MT", imoveisIds: ["i1", "i2"] },
  { id: "c2", nome: "João Batista Ferreira", cpfCnpj: "452.118.330-22", telefone: "(64) 98123-7788", email: "jb.ferreira@gmail.com", endereco: "Sítio Recanto Verde, Zona Rural", municipio: "Rio Verde", estado: "GO", imoveisIds: ["i3"] },
  { id: "c3", nome: "Agropastoril Três Rios S/A", cpfCnpj: "33.987.654/0001-12", telefone: "(34) 3214-9090", email: "contato@tresrios.agr.br", endereco: "Av. Brasil, 1820 - Centro", municipio: "Uberaba", estado: "MG", imoveisIds: ["i4", "i5"] },
  { id: "c4", nome: "Maria Aparecida Lopes", cpfCnpj: "789.654.321-00", telefone: "(67) 99221-3344", email: "maria.lopes@hotmail.com", endereco: "Faz. Santa Clara", municipio: "Dourados", estado: "MS", imoveisIds: ["i6"] },
  { id: "c5", nome: "Sebastião Rocha & Filhos Ltda", cpfCnpj: "08.456.789/0001-55", telefone: "(62) 3251-1010", email: "sebastiao@rochaagro.com.br", endereco: "Faz. Esperança, Estrada Velha", municipio: "Jataí", estado: "GO", imoveisIds: ["i7"] },
];

// ───────────────── Imóveis ─────────────────
type ImovelSeed = {
  nome: string; mun: string; comarca: string; uf: string;
  centro: [number, number]; w: number; h: number; areaHa: number;
  status: ProcessStatus; progresso: number; cliente: number;
};

const seeds: ImovelSeed[] = [
  { nome: "Fazenda Boa Vista", mun: "Sorriso", comarca: "Sorriso", uf: "MT", centro: [-12.5453, -55.7211], w: 4.5, h: 3.2, areaHa: 1248.45, status: "sigef", progresso: 78, cliente: 0 },
  { nome: "Sítio Esperança", mun: "Sorriso", comarca: "Sorriso", uf: "MT", centro: [-12.5810, -55.6802], w: 1.8, h: 1.4, areaHa: 213.78, status: "processamento", progresso: 42, cliente: 0 },
  { nome: "Sítio Recanto Verde", mun: "Rio Verde", comarca: "Rio Verde", uf: "GO", centro: [-17.7977, -50.9266], w: 2.1, h: 1.6, areaHa: 287.32, status: "campo", progresso: 18, cliente: 1 },
  { nome: "Faz. Três Rios I", mun: "Uberaba", comarca: "Uberaba", uf: "MG", centro: [-19.7472, -47.9381], w: 5.2, h: 4.1, areaHa: 1875.62, status: "concluido", progresso: 100, cliente: 2 },
  { nome: "Faz. Três Rios II", mun: "Uberaba", comarca: "Uberaba", uf: "MG", centro: [-19.7102, -47.8920], w: 3.4, h: 2.8, areaHa: 856.91, status: "cartorio", progresso: 92, cliente: 2 },
  { nome: "Faz. Santa Clara", mun: "Dourados", comarca: "Dourados", uf: "MS", centro: [-22.2231, -54.8120], w: 2.7, h: 2.0, areaHa: 432.18, status: "conferencia", progresso: 58, cliente: 3 },
  { nome: "Faz. Esperança", mun: "Jataí", comarca: "Jataí", uf: "GO", centro: [-17.8806, -51.7142], w: 6.1, h: 4.8, areaHa: 2341.07, status: "documentacao", progresso: 65, cliente: 4 },
  { nome: "Sítio Aroeira", mun: "Sorriso", comarca: "Sorriso", uf: "MT", centro: [-12.5102, -55.7589], w: 1.2, h: 0.9, areaHa: 98.42, status: "pendente", progresso: 25, cliente: 0 },
  { nome: "Faz. Vale do Sol", mun: "Rio Verde", comarca: "Rio Verde", uf: "GO", centro: [-17.7521, -50.9802], w: 3.8, h: 3.0, areaHa: 1024.55, status: "sigef", progresso: 81, cliente: 1 },
  { nome: "Faz. Barra Mansa", mun: "Sinop", comarca: "Sinop", uf: "MT", centro: [-11.8604, -55.5021], w: 5.6, h: 4.3, areaHa: 2104.30, status: "campo", progresso: 12, cliente: 0 },
  { nome: "Sítio das Palmeiras", mun: "Dourados", comarca: "Dourados", uf: "MS", centro: [-22.1840, -54.8632], w: 1.4, h: 1.1, areaHa: 142.66, status: "documentacao", progresso: 71, cliente: 3 },
  { nome: "Faz. Santa Helena", mun: "Jataí", comarca: "Jataí", uf: "GO", centro: [-17.9204, -51.6608], w: 4.2, h: 3.4, areaHa: 1432.18, status: "conferencia", progresso: 49, cliente: 4 },
  { nome: "Faz. Riacho Doce", mun: "Patrocínio", comarca: "Patrocínio", uf: "MG", centro: [-18.9405, -46.9938], w: 3.1, h: 2.5, areaHa: 712.40, status: "processamento", progresso: 38, cliente: 2 },
  { nome: "Sítio Boa Esperança II", mun: "Rio Verde", comarca: "Rio Verde", uf: "GO", centro: [-17.8230, -50.9012], w: 1.6, h: 1.3, areaHa: 187.55, status: "pendente", progresso: 8, cliente: 1 },
  { nome: "Faz. Cristalina", mun: "Sorriso", comarca: "Sorriso", uf: "MT", centro: [-12.6210, -55.7402], w: 4.8, h: 3.7, areaHa: 1654.92, status: "sigef", progresso: 85, cliente: 0 },
  { nome: "Faz. Ponta Verde", mun: "Sinop", comarca: "Sinop", uf: "MT", centro: [-11.9022, -55.4630], w: 3.2, h: 2.6, areaHa: 768.21, status: "cartorio", progresso: 95, cliente: 0 },
];

export const imoveis: Imovel[] = seeds.map((s, i) => {
  const id = `i${i + 1}`;
  const poligono = poligonoAo(s.centro, s.w, s.h);
  const cliente = clientes[s.cliente];
  // Datas variadas: alguns prazos vencidos (2024), alguns próximos (2025), alguns futuros (2026)
  const mesInicio = (i % 11) + 1;
  const mesPrev = ((i * 2) % 12) + 1;
  const anoPrev = i % 4 === 0 ? 2025 : i % 5 === 0 ? 2024 : 2026;
  return {
    id,
    nome: s.nome,
    matricula: `${1000 + i * 13}.${String(20 + i).padStart(3, "0")}`,
    codigoIncra: `${s.uf}.${String(100000 + i * 7).slice(0, 6)}.${String(2000 + i)}-${i + 1}`,
    ccir: `${String(900000 + i * 9).padStart(8, "0")}-${i % 9}`,
    municipio: s.mun,
    comarca: s.comarca,
    estado: s.uf,
    areaHa: s.areaHa,
    areaM2: Math.round(s.areaHa * 10000),
    proprietarioId: cliente.id,
    proprietarioNome: cliente.nome,
    cpfCnpj: cliente.cpfCnpj,
    situacao: i % 4 === 0 ? "Regular" : i % 4 === 1 ? "Em regularização" : i % 4 === 2 ? "Com pendências" : "Regular",
    dataInicio: `2024-${String(mesInicio).padStart(2, "0")}-${String(((i * 3) % 27) + 1).padStart(2, "0")}`,
    dataPrevisao: `${anoPrev}-${String(mesPrev).padStart(2, "0")}-${String(((i * 5) % 27) + 1).padStart(2, "0")}`,
    responsavelTecnico: rt[i % rt.length],
    equipeCampo: [eq[i % eq.length], eq[(i + 1) % eq.length]],
    status: s.status,
    progresso: s.progresso,
    centro: s.centro,
    poligono,
    vertices: gerarVertices(poligono, i * 10 + 1),
    confrontantes: [
      { id: `cf-${i}-1`, nome: i % 2 ? "Antônio Pereira da Silva" : "Faz. São José Ltda", tipoDivisa: "Cerca", lado: "Norte", obs: "Cerca de arame farpado, 4 fios" },
      { id: `cf-${i}-2`, nome: "Estrada Vicinal Municipal", tipoDivisa: "Estrada", lado: "Leste" },
      { id: `cf-${i}-3`, nome: i % 3 ? "Córrego do Brejo" : "Rio Pardo", tipoDivisa: i % 3 ? "Córrego" : "Rio", lado: "Sul" },
      { id: `cf-${i}-4`, nome: "Manoel da Costa Júnior", tipoDivisa: "Cerca", lado: "Oeste", documento: "Matr. 4.512" },
    ],
    notasInternas: i % 2 ? "Cliente solicitou agilidade no SIGEF. Área de APP a delimitar próximo ao córrego." : undefined,
  };
});

// ───────────────── Pontos (banco) ─────────────────
export const pontos: Ponto[] = imoveis.flatMap((im) =>
  im.vertices.map((v, idx) => ({
    id: `p-${im.id}-${idx}`,
    codigo: v.codigo,
    nome: `${im.nome} – ${v.codigo}`,
    tipo: v.tipo === "M" ? "Marco" : v.tipo === "V" ? "Apoio" : "Levantamento",
    categoria: "Vértice de divisa",
    descricao: `Vértice ${v.codigo} do imóvel ${im.nome}`,
    leste: v.leste,
    norte: v.norte,
    latitude: v.latitude,
    longitude: v.longitude,
    altitude: v.altitude,
    sistema: v.sistema,
    datum: v.datum,
    precisaoH: v.precisao,
    precisaoV: v.precisao * 1.4,
    metodo: v.metodo,
    equipamento: idx % 2 ? "Trimble R10" : "Leica GS18",
    data: v.data,
    operador: rt[idx % rt.length],
    imovelId: im.id,
    municipio: im.municipio,
  }))
);

// ───────────────── Documentos ─────────────────
const tiposDoc = [
  { nome: "Matrícula atualizada", cat: "imovel", tipo: "PDF", tam: "412 KB" },
  { nome: "CCIR 2024", cat: "imovel", tipo: "PDF", tam: "210 KB" },
  { nome: "Memorial Descritivo", cat: "tecnico", tipo: "PDF", tam: "1.2 MB" },
  { nome: "Planta Topográfica", cat: "tecnico", tipo: "DWG", tam: "3.4 MB" },
  { nome: "ART de Georreferenciamento", cat: "tecnico", tipo: "PDF", tam: "180 KB" },
  { nome: "Certidão de Ônus Reais", cat: "cartorio", tipo: "PDF", tam: "320 KB" },
  { nome: "RG e CPF do Proprietário", cat: "pessoal", tipo: "PDF", tam: "95 KB" },
  { nome: "Caderneta de Campo", cat: "campo", tipo: "PDF", tam: "560 KB" },
  { nome: "Polígono SIGEF", cat: "sigef", tipo: "KML", tam: "48 KB" },
  { nome: "Fotos da diligência", cat: "campo", tipo: "ZIP", tam: "12.4 MB" },
];

export const documentos: Documento[] = imoveis.flatMap((im, i) =>
  tiposDoc.map((d, j) => ({
    id: `doc-${im.id}-${j}`,
    nome: d.nome,
    categoria: d.cat as Documento["categoria"],
    tipo: d.tipo,
    tamanho: d.tam,
    data: `2024-${String(((j + i) % 12) + 1).padStart(2, "0")}-${String(((j * 3) % 27) + 1).padStart(2, "0")}`,
    status: (i + j) % 5 === 0 ? "pendente" : (i + j) % 3 === 0 ? "enviado" : "conferido",
    imovelId: im.id,
  }))
);

// ───────────────── Histórico ─────────────────
export const historico: HistoricoEntry[] = imoveis.flatMap((im) => [
  { id: `h-${im.id}-1`, imovelId: im.id, data: im.dataInicio, usuario: im.responsavelTecnico, acao: "Cadastro do imóvel criado" },
  { id: `h-${im.id}-2`, imovelId: im.id, data: "2024-09-04", usuario: im.responsavelTecnico, acao: "Levantamento de campo iniciado" },
  { id: `h-${im.id}-3`, imovelId: im.id, data: "2024-10-12", usuario: "Eng. Patrícia Oliveira", acao: "Conferência de coordenadas concluída" },
  { id: `h-${im.id}-4`, imovelId: im.id, data: "2024-11-20", usuario: "Téc. Bruno", acao: "Memorial descritivo gerado" },
]);

export const municipiosUnicos = Array.from(new Set(imoveis.map((i) => `${i.municipio}/${i.estado}`)));
