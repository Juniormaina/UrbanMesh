import { useEffect, useMemo, useRef } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import type { IncidentPublic } from "../../lib/api";
import { labelForCategory } from "../../lib/categories";
import { StatusBadge } from "../ui/StatusBadge";
import { Link } from "react-router-dom";
import { useTheme } from "../../lib/theme";
import { HEAT_DARK, HEAT_LIGHT, MARKER, tilesFor } from "../../lib/mapStyle";

export const KILIMANI_CENTER: [number, number] = [-1.2921, 36.785];

function HeatLayer({
  points,
  dark,
}: {
  points: IncidentPublic[];
  dark: boolean;
}) {
  const map = useMap();
  const heatData = useMemo(
    () =>
      points
        .filter((p) => p.is_verified)
        .map((p) => [p.lat, p.lng, p.severity === "critical" ? 0.85 : 0.55] as [number, number, number]),
    [points],
  );

  useEffect(() => {
    if (heatData.length === 0) return;
    const layer = L.heatLayer(heatData, {
      radius: 22,
      blur: 18,
      maxZoom: 17,
      max: 1,
      minOpacity: dark ? 0.28 : 0.18,
      gradient: dark ? HEAT_DARK : HEAT_LIGHT,
    });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, heatData, dark]);

  return null;
}

function FitOnce({ points }: { points: IncidentPublic[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || points.length === 0) return;
    fitted.current = true;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds.pad(0.16), { maxZoom: 16, animate: false });
  }, [map, points]);
  return null;
}

function FlyToUser({
  user,
  nonce,
}: {
  user: { lat: number; lng: number } | null;
  nonce: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (!user || nonce === 0) return;
    map.flyTo([user.lat, user.lng], 17, { duration: 0.7 });
  }, [map, user, nonce]);
  return null;
}

function markerFill(incident: IncidentPublic): string {
  if (!incident.is_verified) return MARKER.pending;
  if (incident.severity === "critical") return MARKER.critical;
  return MARKER.verified;
}

export function LiveMap({
  incidents,
  user,
  locateNonce = 0,
  className = "",
}: {
  incidents: IncidentPublic[];
  user: { lat: number; lng: number } | null;
  locateNonce?: number;
  className?: string;
}) {
  const { dark } = useTheme();
  const tiles = tilesFor(dark);
  const mapRef = useRef<L.Map | null>(null);

  return (
    <div className={`absolute inset-0 ${className}`}>
      <MapContainer
        center={KILIMANI_CENTER}
        zoom={15}
        scrollWheelZoom
        className="h-full w-full"
        attributionControl
        zoomControl={false}
        ref={(map) => {
          mapRef.current = map ?? null;
        }}
      >
        <TileLayer
          key={dark ? "dark" : "light"}
          attribution={tiles.attribution}
          url={tiles.url}
          maxZoom={19}
        />
        <HeatLayer points={incidents} dark={dark} />
        <FitOnce points={incidents} />
        <FlyToUser user={user} nonce={locateNonce} />
        {incidents.map((inc) => (
          <CircleMarker
            key={inc.id}
            center={[inc.lat, inc.lng]}
            radius={inc.is_verified ? 8 : 5}
            pathOptions={{
              color: dark ? "#EEE9E1" : "#FFFFFF",
              weight: inc.is_verified ? 2 : 1.5,
              fillColor: markerFill(inc),
              fillOpacity: inc.is_verified ? 0.95 : 0.8,
              dashArray: inc.is_verified ? undefined : "3 3",
            }}
          >
            <Popup>
              <div className="min-w-[168px] space-y-1.5">
                <p className="text-sm font-semibold">{labelForCategory(inc.category)}</p>
                <StatusBadge verified={inc.is_verified} size="sm" />
                <p className="text-xs text-civic-slate">{inc.corridor}</p>
                <p className="text-[11px] text-civic-muted">
                  {inc.nearby_count} nearby report{inc.nearby_count === 1 ? "" : "s"} · 15 m
                </p>
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
          <>
            <Circle
              center={[user.lat, user.lng]}
              radius={28}
              pathOptions={{
                color: MARKER.you,
                weight: 1,
                fillColor: MARKER.you,
                fillOpacity: dark ? 0.08 : 0.12,
              }}
            />
            <CircleMarker
              center={[user.lat, user.lng]}
              radius={6}
              pathOptions={{
                color: "#FFFFFF",
                weight: 2,
                fillColor: MARKER.you,
                fillOpacity: 1,
              }}
            />
          </>
        ) : null}
      </MapContainer>
      <div className="absolute right-3 top-[42%] z-[500] flex flex-col overflow-hidden rounded-card border border-civic-line bg-civic-surface shadow-card">
        <button
          type="button"
          aria-label="Zoom in"
          className="h-9 w-9 text-lg font-semibold text-civic-ink"
          onClick={() => mapRef.current?.zoomIn()}
        >
          +
        </button>
        <span className="h-px bg-civic-line" />
        <button
          type="button"
          aria-label="Zoom out"
          className="h-9 w-9 text-lg font-semibold text-civic-ink"
          onClick={() => mapRef.current?.zoomOut()}
        >
          −
        </button>
      </div>
    </div>
  );
}
