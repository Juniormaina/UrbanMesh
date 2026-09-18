import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchReports, type IncidentPublic } from "../lib/api";
import { HAZARD_OPTIONS } from "../lib/categories";
import { useLocationState } from "../lib/location";
import { ErrorBanner } from "../components/ui/ReportCard";
import { LiveMap } from "../components/map/LiveMap";

export function MapHomePage() {
  const { coords, requestLocation, locating } = useLocationState();
  const [incidents, setIncidents] = useState<IncidentPublic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("all");
  const [locateNonce, setLocateNonce] = useState(0);

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

  const visible = useMemo(
    () =>
      category === "all"
        ? incidents
        : incidents.filter((i) => i.category === category),
    [incidents, category],
  );

  const verified = visible.filter((i) => i.is_verified).length;
  const pending = visible.length - verified;

  function onLocate() {
    requestLocation();
    setLocateNonce((n) => n + 1);
  }

  return (
    <div className="absolute inset-0">
      <LiveMap incidents={visible} user={coords} locateNonce={locateNonce} />

      <div className="pointer-events-none absolute inset-x-0 top-3 z-10 px-3">
        <div className="pointer-events-auto flex gap-2 overflow-x-auto pb-1">
          <FilterChip
            active={category === "all"}
            onClick={() => setCategory("all")}
          >
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
      </div>

      {error ? (
        <div className="absolute inset-x-3 top-16 z-10">
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
