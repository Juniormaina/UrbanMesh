import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import {
  fetchVerifiedIncidents,
  type VerifiedIncident,
} from "../../lib/api";
import { labelForCategory } from "../../lib/categories";

/** Kilimani, Nairobi — default map centre. */
const KILIMANI_CENTER: [number, number] = [-1.2921, 36.785];
const DEFAULT_ZOOM = 15;

function HeatLayer({ points }: { points: VerifiedIncident[] }) {
  const map = useMap();

  const heatData = useMemo(
    () => points.map((p) => [p.lat, p.lng, 0.65] as [number, number, number]),
    [points],
  );

  useEffect(() => {
    if (heatData.length === 0) return;

    const layer = L.heatLayer(heatData, {
      radius: 28,
      blur: 22,
      maxZoom: 17,
      max: 1,
      gradient: {
        0.2: "#7ED6C1",
        0.45: "#F0C75E",
        0.7: "#E07A3D",
        1: "#B83227",
      },
    });

    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, heatData]);

  return null;
}

function FitToIncidents({ points }: { points: VerifiedIncident[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds.pad(0.2), { maxZoom: 16 });
  }, [map, points]);

  return null;
}

export function SafetyHeatmap() {
  const [incidents, setIncidents] = useState<VerifiedIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchVerifiedIncidents();
        if (!cancelled) setIncidents(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load heatmap.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-civic-line">
      <header className="flex items-start justify-between gap-3 border-b border-civic-line px-4 py-3 sm:px-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-civic-ink sm:text-2xl">
            Walkability &amp; Safety Heatmap
          </h2>
          <p className="mt-1 text-sm font-medium text-civic-slate/80">
            Live density of verified hazards across Kilimani.
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-civic-mist px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-civic-slate">
          {loading ? "…" : `${incidents.length} verified`}
        </span>
      </header>

      {error ? (
        <p className="mx-4 my-3 rounded-xl bg-civic-alert/10 px-3 py-2 text-sm font-bold text-civic-alert sm:mx-5">
          {error}
        </p>
      ) : null}

      <div className="relative h-[min(58vh,420px)] w-full bg-civic-mist">
        <MapContainer
          center={KILIMANI_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={false}
          className="h-full w-full"
          attributionControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <HeatLayer points={incidents} />
          <FitToIncidents points={incidents} />
          {incidents.map((inc) => (
            <CircleMarker
              key={inc.id}
              center={[inc.lat, inc.lng]}
              radius={6}
              pathOptions={{
                color: "#0B1F2A",
                weight: 1,
                fillColor: "#C45C26",
                fillOpacity: 0.85,
              }}
            >
              <Popup>
                <strong>{labelForCategory(inc.category)}</strong>
                <br />
                {inc.description}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {!loading && incidents.length === 0 && !error ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-4">
            <p className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-civic-slate shadow-card ring-1 ring-civic-line">
              No verified clusters yet — your report can start one.
            </p>
          </div>
        ) : null}
      </div>

      <footer className="flex flex-wrap gap-3 border-t border-civic-line px-4 py-3 text-xs font-bold text-civic-slate sm:px-5">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#7ED6C1]" /> Low
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#F0C75E]" /> Moderate
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#E07A3D]" /> High
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#B83227]" /> Critical
        </span>
      </footer>
    </section>
  );
}
