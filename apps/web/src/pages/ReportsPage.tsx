import { useEffect, useMemo, useState } from "react";
import {
  fetchNearbyReports,
  fetchReports,
  type IncidentPublic,
} from "../lib/api";
import { HAZARD_OPTIONS } from "../lib/categories";
import { useLocationState } from "../lib/location";
import { EmptyState, ErrorBanner, ReportCard } from "../components/ui/ReportCard";
import { Link } from "react-router-dom";

type Tab = "nearby" | "recent" | "verified";

export function ReportsPage() {
  const { coords, requestLocation } = useLocationState();
  const [tab, setTab] = useState<Tab>("nearby");
  const [items, setItems] = useState<IncidentPublic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let data: IncidentPublic[] = [];
        if (tab === "nearby") {
          if (!coords) {
            data = [];
          } else {
            data = await fetchNearbyReports(coords.lat, coords.lng, 900);
          }
        } else if (tab === "verified") {
          data = await fetchReports({ status: "verified", limit: 80 });
        } else {
          data = await fetchReports({ status: "all", limit: 80 });
        }
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load reports.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [tab, coords]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (status === "verified" && !item.is_verified) return false;
      if (status === "pending" && item.is_verified) return false;
      return true;
    });
  }, [items, category, status]);

  return (
    <div className="px-4 py-4 pb-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-civic-muted">
            Nearby evidence across Kilimani.
          </p>
        </div>
        <Link
          to="/report"
          className="rounded-card bg-civic-accent px-3 py-2 text-xs font-semibold text-white"
        >
          + Report
        </Link>
      </div>

      <div className="mb-3 flex rounded-card border border-civic-line bg-civic-mist p-1">
        {(["nearby", "recent", "verified"] as Tab[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 rounded-[10px] py-2 text-xs font-semibold capitalize ${
              tab === id ? "bg-civic-surface text-civic-ink shadow-card" : "text-civic-muted"
            }`}
          >
            {id}
          </button>
        ))}
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-civic-line bg-civic-surface px-3 py-2 text-xs font-semibold"
        >
          <option value="all">Category</option>
          {HAZARD_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-civic-line bg-civic-surface px-3 py-2 text-xs font-semibold"
        >
          <option value="all">Status</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {tab === "nearby" && !coords ? (
        <EmptyState
          title="Turn on location"
          body="UrbanMesh uses your position to show hazards within walking distance of you."
        />
      ) : null}

      {tab === "nearby" && !coords ? (
        <button
          type="button"
          onClick={requestLocation}
          className="mt-3 w-full rounded-card border border-civic-line bg-civic-surface py-3 text-sm font-semibold"
        >
          Use my location
        </button>
      ) : null}

      {error ? <ErrorBanner message={error} /> : null}
      {loading ? (
        <p className="text-sm font-medium text-civic-muted">Loading reports…</p>
      ) : null}

      {!loading && filtered.length === 0 && (tab !== "nearby" || coords) ? (
        <EmptyState
          title="No reports in this view"
          body="Try another tab or category — or log the first report on this stretch."
        />
      ) : null}

      <div className="space-y-3">
        {filtered.map((incident) => (
          <ReportCard key={incident.id} incident={incident} />
        ))}
      </div>
    </div>
  );
}
