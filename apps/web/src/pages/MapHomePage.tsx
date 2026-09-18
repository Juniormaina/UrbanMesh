import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchReports, type IncidentPublic } from "../lib/api";
import { HAZARD_OPTIONS } from "../lib/categories";
import { useLocationState } from "../lib/location";
import { ErrorBanner, ReportCard } from "../components/ui/ReportCard";
import { LiveMap } from "../components/map/LiveMap";
import { searchKilimaniPlaces, type KilimaniPlace } from "../lib/places";

type StatusFilter = "all" | "verified" | "pending";
type MapView = "map" | "list";

export function MapHomePage() {
  const { coords, requestLocation, locating } = useLocationState();
  const [incidents, setIncidents] = useState<IncidentPublic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [view, setView] = useState<MapView>("map");
  const [locateNonce, setLocateNonce] = useState(0);
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState<{ lat: number; lng: number; zoom?: number } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchReports({ status: "all", limit: 500 });
        if (!cancelled) {
          setIncidents(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load the map.");
        }
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), 45_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const visible = useMemo(() => {
    return incidents.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (status === "verified" && !item.is_verified) return false;
      if (status === "pending" && item.is_verified) return false;
      return true;
    });
  }, [incidents, category, status]);

  const verified = visible.filter((i) => i.is_verified).length;
  const pending = visible.length - verified;
  const suggestions = searchKilimaniPlaces(query);

  function onLocate() {
    setFocus(null);
    requestLocation();
    setLocateNonce((n) => n + 1);
  }

  function onPickPlace(place: KilimaniPlace) {
    setQuery(place.name);
    setFocus({ lat: place.lat, lng: place.lng, zoom: 17 });
    setLocateNonce((n) => n + 1);
    setView("map");
  }

  return (
    <div className="absolute inset-0">
      {view === "map" ? (
        <LiveMap
          incidents={visible}
          user={coords}
          locateNonce={locateNonce}
          focus={focus}
          showVerified={status !== "pending"}
          showPending={status !== "verified"}
        />
      ) : (
        <div className="absolute inset-0 overflow-y-auto bg-civic-paper px-3 pb-36 pt-44">
          {visible.length === 0 ? (
            <p className="text-sm font-medium text-civic-muted">
              No reports match these filters.
            </p>
          ) : (
            <div className="space-y-3">
              {visible.map((incident) => (
                <ReportCard key={incident.id} incident={incident} />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-3 z-10 px-3">
        <div className="pointer-events-auto space-y-2">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Kilimani streets"
              className="w-full rounded-card border border-civic-line bg-civic-surface px-3 py-2.5 text-sm shadow-card outline-none"
            />
            {suggestions.length > 0 ? (
              <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-card border border-civic-line bg-civic-surface shadow-card">
                {suggestions.map((place) => (
                  <li key={place.name}>
                    <button
                      type="button"
                      onClick={() => onPickPlace(place)}
                      className="flex w-full flex-col px-3 py-2 text-left text-sm"
                    >
                      <span className="font-semibold">{place.name}</span>
                      <span className="text-xs text-civic-muted">{place.hint}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
              All
            </FilterChip>
            {HAZARD_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.value}
                active={category === opt.value}
                onClick={() => setCategory(opt.value)}
              >
                {opt.label}
              </FilterChip>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <FilterChip active={status === "all"} onClick={() => setStatus("all")}>
              All statuses
            </FilterChip>
            <FilterChip
              active={status === "verified"}
              onClick={() => setStatus("verified")}
            >
              Verified clusters
            </FilterChip>
            <FilterChip
              active={status === "pending"}
              onClick={() => setStatus("pending")}
            >
              Pending reports
            </FilterChip>
          </div>
        </div>
      </div>

      {error ? (
        <div className="absolute inset-x-3 top-[9.5rem] z-10">
          <ErrorBanner message={error} />
        </div>
      ) : null}

      <div className="absolute bottom-5 left-3 z-10 max-w-[calc(100%-7.5rem)]">
        <div className="rounded-card border border-civic-line bg-civic-surface/95 px-3 py-2 shadow-card">
          <p className="text-sm font-semibold text-civic-ink">
            {verified} verified hazards
          </p>
          <p className="text-xs font-medium text-civic-muted">
            {pending} pending reports
          </p>
          <p className="mt-1 text-[11px] text-civic-muted">
            Solid pins are 15 m clusters (3+ same-category reports). Dashed pins are still pending.
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-wide text-civic-muted">
            <span className="inline-flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-civic-verified" /> Verified
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-civic-pending" /> Pending
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="h-2 w-2 rounded-full bg-civic-critical" /> Critical
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 right-3 z-10 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setView((v) => (v === "map" ? "list" : "map"))}
          className="rounded-card border border-civic-line bg-civic-surface px-3 py-2 text-xs font-semibold text-civic-ink shadow-card"
        >
          {view === "map" ? "List" : "Map"}
        </button>
        <button
          type="button"
          onClick={onLocate}
          className="rounded-card border border-civic-line bg-civic-surface px-3 py-2 text-xs font-semibold text-civic-ink shadow-card"
        >
          {locating ? "Locating…" : "Recenter on me"}
        </button>
        <Link
          to="/report"
          className="inline-flex min-h-12 items-center rounded-card bg-civic-accent px-4 text-sm font-semibold text-white shadow-card"
        >
          + Report a hazard
        </Link>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-card ${
        active
          ? "border-civic-ink bg-civic-ink text-civic-paper"
          : "border-civic-line bg-civic-surface text-civic-slate"
      }`}
    >
      {children}
    </button>
  );
}