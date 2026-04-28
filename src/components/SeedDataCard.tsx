import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { seedDemoData } from "@/services/seedDemo";

export function SeedDataCard() {
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  async function onSeed() {
    if (!confirm("Isso vai inserir 5 clientes, 16 imóveis, ~140 pontos, ~160 documentos e histórico de exemplo no banco. Continuar?")) return;
    setLoading(true);
    try {
      const r = await seedDemoData();
      toast.success(`Banco populado: ${r.imoveis} imóveis, ${r.clientes} clientes, ${r.pontos} pontos`);
      qc.invalidateQueries();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao popular dados");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-5 border-dashed border-2">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-display font-semibold">Banco vazio — popule com dados de exemplo</div>
          <div className="text-xs text-muted-foreground mt-1">
            Insere clientes, imóveis georreferenciados, pontos GNSS, documentos e histórico realistas para testar o sistema imediatamente. Você pode apagar tudo depois.
          </div>
        </div>
        <Button onClick={onSeed} disabled={loading} className="gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Inserindo...</> : <><Database className="w-4 h-4" /> Popular agora</>}
        </Button>
      </div>
    </Card>
  );
}
