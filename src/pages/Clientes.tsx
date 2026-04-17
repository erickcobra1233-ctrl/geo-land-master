import { PageHeader } from "@/components/PageHeader";
import { useGeoStore } from "@/store/useGeoStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone, MapPin, Building2 } from "lucide-react";

export default function Clientes() {
  const { clientes, imoveis } = useGeoStore();

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <PageHeader
        breadcrumb="Cadastros"
        title="Clientes & Proprietários"
        subtitle={`${clientes.length} cadastros ativos`}
        actions={<Button size="sm" className="gap-2"><Plus className="w-4 h-4" /> Novo cliente</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.map((c) => {
          const seusImoveis = imoveis.filter((i) => i.proprietarioId === c.id);
          const totalHa = seusImoveis.reduce((s, i) => s + i.areaHa, 0);
          const isPJ = c.cpfCnpj.length > 14;
          return (
            <Card key={c.id} className="p-5 hover:shadow-elevated transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-11 h-11 rounded-md flex items-center justify-center shrink-0 ${isPJ ? "bg-secondary/15 text-secondary" : "bg-primary/15 text-primary"}`}>
                  {isPJ ? <Building2 className="w-5 h-5" /> : <span className="font-display font-bold">{c.nome.split(" ").slice(0, 2).map((n) => n[0]).join("")}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm leading-tight">{c.nome}</div>
                  <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{c.cpfCnpj}</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {c.telefone}</div>
                <div className="flex items-center gap-2 truncate"><Mail className="w-3 h-3" /> {c.email}</div>
                <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {c.municipio}/{c.estado}</div>
              </div>
              <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Imóveis</div>
                  <div className="font-display font-bold text-lg">{seusImoveis.length}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Área total</div>
                  <div className="font-display font-bold text-lg">{totalHa.toFixed(0)} <span className="text-xs font-normal text-muted-foreground">ha</span></div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
