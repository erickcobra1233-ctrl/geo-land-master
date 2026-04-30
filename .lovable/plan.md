## Problema principal

O mapa (Leaflet) está aparecendo **por cima dos dialogs** de "Novo ponto", "Novo imóvel", "Editar imóvel", confirmações de exclusão etc. — incluindo overlay escuro, dropdowns de Select dentro do form, e até o conteúdo do Dialog em si.

**Causa raiz:** o Leaflet aplica `z-index` próprios nos seus painéis (`.leaflet-pane` = 400, `.leaflet-top/bottom` controles = 1000, popups = 700). Os componentes do Radix Dialog/Select usam `z-50` (= 50). Resultado: tiles, polígonos, marcadores e controles do mapa aparecem **na frente** do overlay e do conteúdo do modal sempre que a página de fundo contém um `<MapView>` (Pontos, Mapa, Detalhe do Imóvel → aba Mapa, Dashboard se houver mini-mapa).

## Correção

### 1. Rebaixar todos os z-indexes do Leaflet (`src/index.css`)

Adicionar overrides globais para que o mapa nunca passe acima de `z-40` (abaixo do overlay do Dialog que é `z-50`):

```css
.leaflet-pane,
.leaflet-top,
.leaflet-bottom,
.leaflet-control { z-index: 1 !important; }
.leaflet-tile-pane     { z-index: 1 !important; }
.leaflet-overlay-pane  { z-index: 2 !important; }
.leaflet-shadow-pane   { z-index: 3 !important; }
.leaflet-marker-pane   { z-index: 4 !important; }
.leaflet-tooltip-pane  { z-index: 5 !important; }
.leaflet-popup-pane    { z-index: 6 !important; }
.leaflet-control       { z-index: 7 !important; }
```

Isto resolve o vazamento em **todas** as telas de uma vez (Pontos, Mapa, ImóvelDetalhe, qualquer Dialog/Select/Dropdown que abrir sobre uma página com mapa).

### 2. Ajustar painel flutuante do MapaPage

Em `src/pages/MapaPage.tsx`, o card de detalhe usa `z-[1000]` justamente para vencer o Leaflet antigo. Após o item 1, baixar para `z-30` (continua acima do mapa, abaixo de dialogs).

### 3. Bugs adicionais detectados durante a revisão

- **NovoPontoDialog (`src/pages/Pontos.tsx`)**: o `<Select>` de "Vincular ao imóvel" usa `value={form.imovelId || "none"}` mas o estado inicial é `""` — Radix avisa em console. Garantir o valor sempre definido.
- **Inputs numéricos com valor inicial `0`**: latitude/longitude/altitude começam em `0`, o usuário precisa apagar o zero antes de digitar. Trocar para string controlada `""` e converter no submit, evitando salvar lat/long zerados por engano.
- **Validação mínima de coordenadas**: bloquear submit quando lat=0 e lon=0 (provável esquecimento), com toast de aviso.
- **`MapView` sem cleanup de bounds vazio**: se `imoveis` filtrados ficar vazio em `Pontos`, `fitTo` undefined e `allBounds=[]` — já tratado, mas o mapa fica no centro do Brasil sem aviso. Adicionar mensagem "Sem pontos para exibir" sobreposta quando `pontos.length === 0 && imoveis.length === 0`.
- **ImovelDetalhe → aba "Mapa do Imóvel"**: ao trocar de aba e voltar, o Leaflet às vezes renderiza com tamanho errado (tiles cinzas). Forçar `invalidateSize()` quando a aba ficar visível, via key prop no `<MapView>` baseada na aba ativa, ou montar o mapa só quando a aba estiver ativa.

### 4. QA pós-correção

Após aplicar, abrir em sequência: Pontos → "Novo ponto", Imóveis → "Novo Imóvel" (a partir do topbar, estando na página Mapa), Imóvel Detalhe → "Excluir" (alert dialog), e confirmar visualmente que o overlay escurecido cobre o mapa e o modal fica clicável por inteiro.

## Arquivos alterados

- `src/index.css` — overrides de z-index do Leaflet
- `src/pages/MapaPage.tsx` — z-index do painel flutuante
- `src/pages/Pontos.tsx` — NovoPontoDialog (valores iniciais, validação, Select)
- `src/components/MapView.tsx` — placeholder "sem dados" + invalidateSize on resize
- `src/pages/ImovelDetalhe.tsx` — remount do MapView ao ativar a aba

## Fora de escopo

Não vou mexer em layout visual, dados, RLS, autenticação ou hooks. É correção pontual de z-index e pequenos bugs de UX em formulários.
