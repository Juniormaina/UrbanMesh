import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchClusters,
  fetchMeta,
  fetchReports,
  generateLpdpBrief,
  type IncidentPublic,
  type PlatformMeta,
  type SpatialCluster,
} from "../lib/api";
import { formatCoords, formatWhen } from "../lib/format";
import { StatusBadge } from "../components/ui/Primitives";
import {
  DEFAULT_LAYERS,
  PlannerMap,
  type MapLayers,
} from "../components/map/PlannerMap";

export function LiveMapPage() {
  const [incidents, setIncidents] = useState<IncidentPublic[]>([]);
  const [clusters, setClusters] = useState<SpatialCluster[]>([]);
  const [meta, setMeta] = useState<PlatformMeta | null>(null);
  const [layers, setLayers] = useState<MapLayers>(DEFAULT_LAYERS);
  const [selected, setSelected] = useState<SpatialCluster | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([fetchReports(), fetchClusters(), fetchMeta()]).then(
      ([reports, cls, platform]) => {
        setIncidents(reports);
        setClusters(cls);
        setMeta(platform);
      },
    );
  }, []);

  function toggle(key: keyof MapLayers) {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="flex h-[calc(100dvh-48px)] min-h-[640px] lg:h-dvh">
      <div className="relative min-w-0 flex-1">
        <PlannerMap
          incidents={incidents}
          clusters={clusters}
          meta={meta}
          layers={layers}
          selectedId={selected?.cluster_id}
          onSelectCluster={setSelected}
        />
        <div className="absolute left-3 top-3 w-56 rounded-card border border-civic-line bg-civic-surface/95 p-3 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-civic-muted">
            Layers
          </p>
          {(
            [
              ["verified", "Verified clusters"],
              ["pending", "Pending reports"],
              ["wards", "Ward boundaries"],
              ["roads", "Roads"],
              ["drainage", "Drainage"],
              ["pedestrian", "Pedestrian corridors"],
              ["h3", "H3 cells"],
            ] as Array<[keyof MapLayers, string]>
          ).map(([key, label]) => (
            <label key={key} className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={layers[key]}
                onChange={() => toggle(key)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <aside className="w-full max-w-sm overflow-y-auto border-l border-civic-line bg-civic-surface p-5">
        {selected ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-civic-verified">
              Verified cluster
            </p>
            <h2 className="mt-1 text-xl font-semibold">{selected.category_label}</h2>
            <div className="mt-3">
              <StatusBadge verified />
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Report count" value={String(selected.report_count)} />
              <Row label="Radius" value={`${selected.radius_meters}m`} />
              <Row label="First reported" value={formatWhen(selected.first_reported)} />
              <Row label="Latest report" value={formatWhen(selected.latest_report)} />
              <Row label="Planning area" value={selected.ward_name} />
              <Row label="Corridor" value={selected.corridor} />
              <Row label="Coordinates" value={formatCoords(selected.lat, selected.lng)} />
              <Row label="Verification" value={selected.verification_status} />
            </dl>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                to="/reports"
                className="rounded-card border border-civic-line py-2 text-center text-sm font-semibold"
              >
                View reports
              </Link>
              <button
                type="button"
                onClick={async () => {
                  const result = await generateLpdpBrief([selected.cluster_id]);
                  setMessage(
                    `Added to LPDP evidence — ${result.cluster_count} cluster compiled.`,
                  );
                }}
                className="rounded-card bg-civic-accent py-2 text-sm font-semibold text-white"
              >
                Add to LPDP evidence
              </button>
              {message ? (
                <p className="text-xs font-medium text-civic-accentDark">{message}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold">Geospatial workspace</h2>
            <p className="mt-2 text-sm text-civic-slate">
              Click a verified cluster on the Kilimani map to inspect report count,
              15 m radius and planning area.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-civic-mist py-1.5">
      <dt className="text-civic-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
