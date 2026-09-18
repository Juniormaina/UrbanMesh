import { useEffect, useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import type { IncidentPublic } from "../../lib/api";
import { labelForCategory } from "../../lib/categories";
import { StatusBadge } from "../ui/StatusBadge";
import { Link } from "react-router-dom";

export const KILIMANI_CENTER: [number, number] = [-1.2921, 36.785];

function HeatLayer({ points }: { points: IncidentPublic[] }) {
  const map = useMap();
  const heatData = useMemo(
    () =>
      points
        .filter((p) => p.is_verified)
        .map((p) => [p.lat, p.lng, 0.6] as [number, number, number]),
    [points],
  );

  useEffect(() => {
    if (heatData.length === 0) return;
    const layer = L.heatLayer(heatData, {
      radius: 26,
      blur: 20,
      maxZoom: 17,
      max: 1,
      gradient: {
        0.2: "#c5d4c8",
        0.45: "#d7c48a",
        0.7: "#c98456",
        1: "#a63d2f",
      },
    });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, heatData]);

  return null;
}

function FitAndLocate({
  points,
  user,
}: {
  points: IncidentPublic[];
  user: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (user) {
      map.setView([user.lat, user.lng], 16);
      return;
    }
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds.pad(0.18), { maxZoom: 16 });
  }, [map, points, user]);
  return null;
}

function markerColor(incident: IncidentPublic): string {
  if (!incident.is_verified) return "#A67C2A";
  if (incident.severity === "critical") return "#A63D2F";
  return "#2F6B5A";
}

export function LiveMap({
  incidents,
  user,
  className = "",
}: {
  incidents: IncidentPublic[];
  user: { lat: number; lng: number } | null;
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <MapContainer
        center={KILIMANI_CENTER}
        zoom={15}
        scrollWheelZoom
        className="h-full w-full"
        attributionControl
        zoomControl={false}
      >
        <ZoomControl position="topright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />
        <HeatLayer points={incidents} />
        <FitAndLocate points={incidents} user={user} />
        {incidents.map((inc) => (
          <CircleMarker
            key={inc.id}
            center={[inc.lat, inc.lng]}
            radius={inc.is_verified ? 8 : 6}
            pathOptions={{
              color: "#16181D",
              weight: 1,
              fillColor: markerColor(inc),
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="min-w-[160px] space-y-1">
                <p className="text-sm font-semibold">{labelForCategory(inc.category)}</p>
                <StatusBadge verified={inc.is_verified} size="sm" />
                <p className="text-xs text-civic-slate">{inc.corridor}</p>
                <Link
                  to={`/hazards/${inc.id}`}
                  className="text-xs font-semibold text-civic-accent"
                >
                  View evidence
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        {user ? (
          <CircleMarker
            center={[user.lat, user.lng]}
            radius={7}
            pathOptions={{
              color: "#FFFFFF",
              weight: 2,
              fillColor: "#16181D",
              fillOpacity: 1,
            }}
          />
        ) : null}
      </MapContainer>
    </div>
  );
}
