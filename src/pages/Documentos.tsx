import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useGeoStore } from "@/store/useGeoStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, FileSpreadsheet, FileArchive, Image as ImageIcon, Eye, Download } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const CATS = [
  { id: "all", label: "Todos" },
  { id: "imovel", label: "Documentos do imóvel" },
  { id: "pessoal", label: "Documentos pessoais" },
  { id: "tecnico", label: "Documentos técnicos" },
  { id: "campo", label: "Documentos de campo" },
  { id: "cartorio", label: "Cartorários" },
  { id: "sigef", label: "Para SIGEF" },
];

export default function Documentos() {
  const { documentos, imoveis } = useGeoStore();
  const [cat, setCat] = useState("all");

  const filtered = cat === "all" ? documentos : documentos.filter((d) => d.categoria === cat);

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        breadcrumb="Gestão documental"
        title="Documentos"
        subtitle={`${filtered.length} arquivos no acervo · organizados por categoria`}
        actions={<Button size="sm" className="gap-2"><Upload className="w-4 h-4" /> Enviar arquivo</Button>}
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {CATS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`text-xs font-medium px-3 py-1.5 rounded-md border transition-all ${
              cat === c.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {c.label}
            <span className="ml-1.5 font-mono text-[10px] opacity-80">
              {c.id === "all" ? documentos.length : documentos.filter((d) => d.categoria === c.id).length}
            </span>
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border data-table">
              <th className="text-left px-4 py-3">Documento</th>
              <th className="text-left px-4 py-3">Imóvel</th>
              <th className="text-left px-4 py-3">Categoria</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-right px-4 py-3">Tamanho</th>
              <th className="text-left px-4 py-3">Data</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 60).map((d) => {
              const im = imoveis.find((i) => i.id === d.imovelId);
              return (
                <tr key={d.id} className="border-b border-border hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <DocIcon tipo={d.tipo} />
                      <span className="font-medium">{d.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{im?.nome || "—"}</td>
                  <td className="px-4 py-3 text-xs"><span className="px-2 py-0.5 bg-muted rounded">{d.categoria}</span></td>
                  <td className="px-4 py-3 text-xs font-mono">{d.tipo}</td>
                  <td className="px-4 py-3 text-xs font-mono text-right text-muted-foreground">{d.tamanho}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{format(parseISO(d.data), "dd MMM yyyy", { locale: ptBR })}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                      d.status === "conferido" ? "bg-success/15 text-success" :
                      d.status === "pendente" ? "bg-warning/15 text-warning" : "bg-info/15 text-info"
                    }`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <button className="hover:text-foreground p-1"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="hover:text-foreground p-1"><Download className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function DocIcon({ tipo }: { tipo: string }) {
  if (tipo === "PDF") return <FileText className="w-4 h-4 text-destructive" />;
  if (tipo === "DWG" || tipo === "KML") return <FileSpreadsheet className="w-4 h-4 text-info" />;
  if (tipo === "ZIP") return <FileArchive className="w-4 h-4 text-warning" />;
  return <ImageIcon className="w-4 h-4 text-secondary" />;
}
