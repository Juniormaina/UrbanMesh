import { useEffect, useState } from "react";
import { fetchReports, type IncidentPublic } from "../lib/api";
import { loadMyReportIds } from "../lib/myReports";
import { EmptyState, ErrorBanner, ReportCard } from "../components/ui/ReportCard";
import { Link } from "react-router-dom";

export function MyReportsPage() {
  const [items, setItems] = useState<IncidentPublic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const mine = loadMyReportIds();
        const ids = new Set(mine.map((row) => row.id));
        const all = await fetchReports({ status: "all", limit: 500 });
        if (!cancelled) setItems(all.filter((row) => ids.has(row.id)));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load your reports.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const pending = items.filter((i) => !i.is_verified);
  const verified = items.filter((i) => i.is_verified);

  return (
    <div className="px-4 py-4 pb-8">
      <h1 className="text-xl font-semibold tracking-tight">My reports</h1>
      <p className="mt-1 text-sm text-civic-muted">
        Stored on this device. No public profile — just the hazards you logged in Kilimani.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Submitted" value={items.length} />
        <Stat label="Pending" value={pending.length} />
        <Stat label="Verified" value={verified.length} />
      </div>

      {error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}
      {loading ? (
        <p className="mt-4 text-sm font-medium text-civic-muted">Loading your reports…</p>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No reports from this phone yet"
            body="When you submit a hazard, it will appear here until it is verified by nearby residents."
          />
          <Link
            to="/report"
            className="mt-3 block rounded-card bg-civic-accent py-3 text-center text-sm font-semibold text-white"
          >
            Report a hazard
          </Link>
        </div>
      ) : null}

      {verified.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-civic-ink">Verified clusters</h2>
          <div className="space-y-3">
            {verified.map((incident) => (
              <ReportCard key={incident.id} incident={incident} />
            ))}
          </div>
        </section>
      ) : null}

      {pending.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-civic-ink">Pending verification</h2>
          <div className="space-y-3">
            {pending.map((incident) => (
              <ReportCard key={incident.id} incident={incident} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-card border border-civic-line bg-civic-surface px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-civic-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
