// Camada central de comunicação com o backend REST do GeoSIGEF.
// Toda chamada HTTP do frontend deve passar por aqui.
//
// Variável de ambiente: VITE_API_URL (ex.: http://localhost:3000)
// Token JWT (quando houver login): localStorage["geosigef.token"]
//
// Padrão de rotas esperado no backend:
//   POST   /auth/login           { email, senha } -> { token, user }
//   GET    /auth/me              -> { user }
//   GET    /imoveis              -> Imovel[]
//   GET    /imoveis/:id          -> Imovel
//   POST   /imoveis              -> Imovel
//   PUT    /imoveis/:id          -> Imovel
//   DELETE /imoveis/:id          -> 204
//   GET    /clientes             -> Cliente[]
//   GET    /clientes/:id         -> Cliente
//   POST   /clientes             -> Cliente
//   PUT    /clientes/:id         -> Cliente
//   DELETE /clientes/:id         -> 204
//   GET    /processos | POST | PUT/:id | DELETE/:id
//   GET    /pontos    | POST | PUT/:id | DELETE/:id
//   GET    /documentos?imovelId=...
//   GET    /historico?imovelId=...

import type { Imovel, Cliente, Ponto, Documento, HistoricoEntry, ProcessStatus } from "@/data/mockData";

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ||
  "http://localhost:3000";

export const TOKEN_KEY = "geosigef.token";
export const USER_KEY = "geosigef.user";

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch (err) {
    throw new ApiError(
      `Não foi possível conectar ao backend em ${API_URL}. Verifique se a API está no ar e se VITE_API_URL está correto.`,
      0,
      err
    );
  }

  if (res.status === 401) {
    // token inválido/expirado — limpa sessão para forçar novo login
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      /* noop */
    }
  }

  if (res.status === 204) return undefined as T;

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && "message" in (data as object)
        ? String((data as { message: unknown }).message)
        : `Erro ${res.status} em ${path}`) || `Erro ${res.status}`;
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}

const http = {
  get: <T>(p: string) => request<T>(p, { method: "GET" }),
  post: <T>(p: string, body?: unknown) =>
    request<T>(p, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(p: string, body?: unknown) =>
    request<T>(p, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  del: <T>(p: string) => request<T>(p, { method: "DELETE" }),
};

// ───────────────────── Auth ─────────────────────
export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  papel?: string;
}

export const authApi = {
  login: (email: string, senha: string) =>
    http.post<{ token: string; user: AuthUser }>("/auth/login", { email, senha }),
  me: () => http.get<{ user: AuthUser }>("/auth/me"),
};

// ─────────────────── Imóveis ───────────────────
export type ImovelInput = Partial<Omit<Imovel, "id">>;

export const imoveisApi = {
  list: () => http.get<Imovel[]>("/imoveis"),
  get: (id: string) => http.get<Imovel>(`/imoveis/${id}`),
  create: (data: ImovelInput) => http.post<Imovel>("/imoveis", data),
  update: (id: string, data: ImovelInput) => http.put<Imovel>(`/imoveis/${id}`, data),
  remove: (id: string) => http.del<void>(`/imoveis/${id}`),
  updateStatus: (id: string, status: ProcessStatus) =>
    http.put<Imovel>(`/imoveis/${id}`, { status }),
};

// ─────────────────── Clientes ───────────────────
export type ClienteInput = Partial<Omit<Cliente, "id" | "imoveisIds">>;

export const clientesApi = {
  list: () => http.get<Cliente[]>("/clientes"),
  get: (id: string) => http.get<Cliente>(`/clientes/${id}`),
  create: (data: ClienteInput) => http.post<Cliente>("/clientes", data),
  update: (id: string, data: ClienteInput) => http.put<Cliente>(`/clientes/${id}`, data),
  remove: (id: string) => http.del<void>(`/clientes/${id}`),
};

// ─────────────────── Processos ───────────────────
// (rotas previstas — usadas em rodadas futuras)
export const processosApi = {
  list: () => http.get<unknown[]>("/processos"),
  get: (id: string) => http.get<unknown>(`/processos/${id}`),
  create: (data: unknown) => http.post<unknown>("/processos", data),
  update: (id: string, data: unknown) => http.put<unknown>(`/processos/${id}`, data),
  remove: (id: string) => http.del<void>(`/processos/${id}`),
};

// ─────────────────── Pontos ───────────────────
export type PontoInput = Partial<Omit<Ponto, "id">>;
export const pontosApi = {
  list: () => http.get<Ponto[]>("/pontos"),
  get: (id: string) => http.get<Ponto>(`/pontos/${id}`),
  create: (data: PontoInput) => http.post<Ponto>("/pontos", data),
  update: (id: string, data: PontoInput) => http.put<Ponto>(`/pontos/${id}`, data),
  remove: (id: string) => http.del<void>(`/pontos/${id}`),
};

// ─────────────────── Documentos / Histórico ───────────────────
export const documentosApi = {
  listByImovel: (imovelId: string) =>
    http.get<Documento[]>(`/documentos?imovelId=${encodeURIComponent(imovelId)}`),
};
export const historicoApi = {
  listByImovel: (imovelId: string) =>
    http.get<HistoricoEntry[]>(`/historico?imovelId=${encodeURIComponent(imovelId)}`),
};
