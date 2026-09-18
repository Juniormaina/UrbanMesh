import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Polygon,
  Polyline,
  Popup,
  Rectangle,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { cellToBoundary } from "h3-js";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import type {
  IncidentPublic,
  PlatformMeta,
  SpatialCluster,
} from "../../lib/api";

const KILIMANI: [number, number] = [-1.2921, 36.785];

export interface MapLayers {
  verified: boolean;
  pending: boolean;
  wards: boolean;
  roads: boolean;
  drainage: boolean;
  pedestrian: boolean;
  h3: boolean;
}

function HeatLayer({ points }: { points: IncidentPublic[] }) {
  const map = useMap();
  const heatData = useMemo(
    () =>
      points
        .filter((p) => p.is_verified)
        .map((p) => [p.lat, p.lng, 0.55] as [number, number, number]),
    [points],
  );
  useEffect(() => {
    if (heatData.length === 0) return;
    const layer = L.heatLayer(heatData, {
      radius: 28,
      blur: 22,
      maxZoom: 17,
      gradient: {
        0.2: "#c5d4c8",
        0.5: "#d7c48a",
        0.8: "#a63d2f",
      },
    });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, heatData]);
  return null;
}

export function PlannerMap({
  incidents,
  clusters,
  meta,
  layers,
  selectedId,
  onSelectCluster,
}: {
  incidents: IncidentPublic[];
  clusters: SpatialCluster[];
  meta: PlatformMeta | null;
  layers: MapLayers;
  selectedId?: string | null;
  onSelectCluster?: (cluster: SpatialCluster) => void;
}) {
  const h3Cells = useMemo(() => {
    const unique = [...new Set(incidents.map((i) => i.h3_index).filter(Boolean))];
    return unique.map((cell) => ({
      cell,
      path: cellToBoundary(cell) as Array<[number, number]>,
    }));
  }, [incidents]);

  const roads = meta?.corridors.filter(
    (c) => c.id === "argwings-kodhek" || c.id === "ngong-road",
  );
  const drainage = meta?.corridors.filter((c) => c.id === "kirichwa-kubwa");
  const pedestrian = meta?.corridors.filter((c) => c.id === "dennis-pritt");

  return (
    <MapContainer
      center={KILIMANI}
      zoom={15}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OSM &copy; CARTO"
      />
      {layers.verified ? <HeatLayer points={incidents} /> : null}

      {layers.wards &&
        meta?.wards.map((ward) => {
          const [minLat, maxLat, minLng, maxLng] = ward.bbox;
          return (
            <Rectangle
              key={ward.id}
              bounds={[
                [minLat, minLng],
                [maxLat, maxLng],
              ]}
              pathOptions={{
                color: "#3F4A52",
                weight: 1,
                fillOpacity: 0.04,
              }}
            >
              <Popup>{ward.name}</Popup>
            </Rectangle>
          );
        })}

      {layers.roads &&
        roads?.map((c) => (
          <Polyline
            key={c.id}
            positions={c.path}
            pathOptions={{ color: "#16181D", weight: 3, opacity: 0.55 }}
          />
        ))}
      {layers.drainage &&
        drainage?.map((c) => (
          <Polyline
            key={c.id}
            positions={c.path}
            pathOptions={{ color: "#3F4A52", weight: 3, dashArray: "6 6" }}
          />
        ))}
      {layers.pedestrian &&
        pedestrian?.map((c) => (
          <Polyline
            key={c.id}
            positions={c.path}
            pathOptions={{ color: "#2F6B5A", weight: 3 }}
          />
        ))}

      {layers.h3 &&
        h3Cells.map((cell) => (
          <Polygon
            key={cell.cell}
            positions={cell.path}
            pathOptions={{
              color: "#2F6B5A",
              weight: 1,
              fillColor: "#2F6B5A",
              fillOpacity: 0.06,
            }}
          />
        ))}

      {layers.pending &&
        incidents
          .filter((i) => !i.is_verified)
          .map((inc) => (
            <CircleMarker
              key={inc.id}
              center={[inc.lat, inc.lng]}
              radius={5}
              pathOptions={{
                color: "#16181D",
                weight: 1,
                fillColor: "#A67C2A",
                fillOpacity: 0.9,
              }}
            >
              <Popup>
                <strong>{inc.category_label}</strong>
                <br />
                Pending · {inc.corridor}
              </Popup>
            </CircleMarker>
          ))}

      {layers.verified &&
        clusters.map((cluster) => (
          <CircleMarker
            key={cluster.cluster_id}
            center={[cluster.lat, cluster.lng]}
            radius={selectedId === cluster.cluster_id ? 14 : 10}
            eventHandlers={{
              click: () => onSelectCluster?.(cluster),
            }}
            pathOptions={{
              color: "#16181D",
              weight: 1,
              fillColor:
                cluster.severity === "critical" ? "#A63D2F" : "#2F6B5A",
              fillOpacity: 0.92,
            }}
          />
        ))}
    </MapContainer>
  );
}

export const DEFAULT_LAYERS: MapLayers = {
  verified: true,
  pending: true,
  wards: true,
  roads: true,
  drainage: false,
  pedestrian: false,
  h3: false,
};
