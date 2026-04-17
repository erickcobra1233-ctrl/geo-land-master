import { create } from "zustand";
import {
  imoveis as seedImoveis,
  pontos as seedPontos,
  clientes as seedClientes,
  documentos as seedDocumentos,
  historico as seedHistorico,
  type Imovel,
  type Ponto,
  type Cliente,
  type Documento,
  type HistoricoEntry,
  type ProcessStatus,
} from "@/data/mockData";

interface GeoState {
  imoveis: Imovel[];
  pontos: Ponto[];
  clientes: Cliente[];
  documentos: Documento[];
  historico: HistoricoEntry[];
  favoritos: string[];
  // ações
  updateImovelStatus: (id: string, status: ProcessStatus) => void;
  toggleFavorito: (id: string) => void;
  addImovel: (i: Imovel) => void;
  removeImovel: (id: string) => void;
  addPonto: (p: Ponto) => void;
  removePonto: (id: string) => void;
  addCliente: (c: Cliente) => void;
}

export const useGeoStore = create<GeoState>((set) => ({
  imoveis: seedImoveis,
  pontos: seedPontos,
  clientes: seedClientes,
  documentos: seedDocumentos,
  historico: seedHistorico,
  favoritos: [],
  updateImovelStatus: (id, status) =>
    set((s) => ({
      imoveis: s.imoveis.map((i) => (i.id === id ? { ...i, status } : i)),
    })),
  toggleFavorito: (id) =>
    set((s) => ({
      favoritos: s.favoritos.includes(id) ? s.favoritos.filter((f) => f !== id) : [...s.favoritos, id],
    })),
  addImovel: (i) => set((s) => ({ imoveis: [i, ...s.imoveis] })),
  removeImovel: (id) => set((s) => ({ imoveis: s.imoveis.filter((i) => i.id !== id) })),
  addPonto: (p) => set((s) => ({ pontos: [p, ...s.pontos] })),
  removePonto: (id) => set((s) => ({ pontos: s.pontos.filter((p) => p.id !== id) })),
  addCliente: (c) => set((s) => ({ clientes: [c, ...s.clientes] })),
}));
