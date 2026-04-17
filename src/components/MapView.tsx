import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import type { Imovel, Ponto } from "@/data/mockData";
import { STATUS_LABEL } from "@/data/mockData";

interface Props {
  imoveis?: Imovel[];
  pontos?: Ponto[];
  selectedId?: string;
  height?: string;
  showLayers?: boolean;
  onImovelClick?: (id: string) => void;
  fitTo?: [number, number][]; // bounds override
}

const STATUS_HEX: Record<string, string> = {
  campo: "#f59e0b",
  processamento: "#1e90d6",
  conferencia: "#9b5de5",
  documentacao: "#c44ba0",
  sigef: "#27a085",
  cartorio: "#d4762a",
  concluido: "#3aa86b",
  pendente: "#e64545",
};

function FitBounds({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 0) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40] });
    }
  }, [bounds, map]);
  return null;
}

export function MapView({ imoveis = [], pontos = [], height = "100%", onImovelClick, fitTo }: Props) {
  // Default Brazil center
  const center: [number, number] = imoveis[0]?.centro ?? [-15.78, -52.93];
  const allBounds: [number, number][] =
    fitTo ?? imoveis.flatMap((i) => i.poligono);

  return (
    <div className="w-full h-full" style={{ height }}>
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom
        className="w-full h-full rounded-lg"
        style={{ height: "100%", minHeight: 240 }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {allBounds.length > 0 && <FitBounds bounds={allBounds} />}

        {imoveis.map((im) => {
          const cor = STATUS_HEX[im.status] || "#1e90d6";
          return (
            <Polygon
              key={im.id}
              positions={im.poligono}
              pathOptions={{ color: cor, weight: 2, fillColor: cor, fillOpacity: 0.18 }}
              eventHandlers={{ click: () => onImovelClick?.(im.id) }}
            >
              <Tooltip sticky direction="top" opacity={0.95}>
                <div className="text-xs">
                  <div className="font-semibold">{im.nome}</div>
                  <div className="text-muted-foreground">
                    {im.areaHa.toFixed(2)} ha · {STATUS_LABEL[im.status]}
                  </div>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-xs space-y-1 min-w-[180px]">
                  <div className="font-bold text-sm">{im.nome}</div>
                  <div><span className="text-muted-foreground">Matr.:</span> {im.matricula}</div>
                  <div><span className="text-muted-foreground">Município:</span> {im.municipio}/{im.estado}</div>
                  <div><span className="text-muted-foreground">Área:</span> {im.areaHa.toFixed(2)} ha</div>
                  <div><span className="text-muted-foreground">Status:</span> {STATUS_LABEL[im.status]}</div>
                </div>
              </Popup>
            </Polygon>
          );
        })}

        {pontos.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.latitude, p.longitude]}
            radius={4}
            pathOptions={{ color: "#0f2a3f", fillColor: "#1e90d6", fillOpacity: 0.9, weight: 1.5 }}
          >
            <Tooltip>
              <div className="text-xs">
                <div className="font-mono font-semibold">{p.codigo}</div>
                <div>{p.tipo}</div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
