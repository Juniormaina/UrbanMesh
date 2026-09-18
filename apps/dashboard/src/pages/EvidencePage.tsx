import { useEffect, useMemo, useState } from "react";
import {
  fetchClusters,
  generateLpdpBrief,
  LPDP_DOWNLOAD_HREF,
  type SpatialCluster,
} from "../lib/api";
import { formatCoords, MONTH_LABEL } from "../lib/format";
import { StatCard, StatusBadge } from "../components/ui/Primitives";

export function EvidencePage() {
  const [clusters, setClusters] = useState<SpatialCluster[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchClusters().then((rows) => {
      setClusters(rows);
      setSelected(rows.map((r) => r.cluster_id));
    });
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, SpatialCluster[]>();
    for (const cluster of clusters) {
      const list = map.get(cluster.corridor) ?? [];
      list.push(cluster);
      map.set(cluster.corridor, list);
    }
    return [...map.entries()];
  }, [clusters]);

  const categories = new Set(clusters.map((c) => c.category_label)).size;

  async function onGenerate() {
    setGenerating(true);
    setMessage(null);
    try {
      const result = await generateLpdpBrief(selected);
      setReady(true);
      setMessage(
        `Brief ready — ${result.cluster_count} verified cluster${result.cluster_count === 1 ? "" : "s"} compiled.`,
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not generate brief.");
    } finally {
      setGenerating(false);
    }
  }

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <div className="p-5 lg:p-7">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Kilimani LPDP Evidence
          </h1>
          <p className="mt-1 text-sm text-civic-muted">{MONTH_LABEL}</p>
        </div>
        <button
          type="button"
          onClick={() => void onGenerate()}
          disabled={generating || selected.length === 0}
          className="rounded-card bg-civic-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {generating ? "Generating…" : "Generate LPDP Brief"}
        </button>
      </header>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="Verified clusters" value={clusters.length} />
        <StatCard label="Priority corridors" value={grouped.length} />
        <StatCard label="Affected categories" value={categories} />
      </div>

      {message ? (
        <p className="mb-4 text-sm font-medium text-civic-accentDark">{message}</p>
      ) : null}

      {ready ? (
        <div className="mb-6 overflow-hidden rounded-card border border-civic-line bg-civic-surface">
          <div className="flex items-center justify-between border-b border-civic-line px-4 py-3">
            <p className="text-sm font-semibold">Policy brief preview</p>
            <a
              href={LPDP_DOWNLOAD_HREF}
              className="text-sm font-semibold text-civic-accent"
            >
              Download policy brief
            </a>
          </div>
          <iframe
            title="LPDP policy brief"
            src={LPDP_DOWNLOAD_HREF}
            className="h-[480px] w-full bg-civic-mist"
          />
        </div>
      ) : null}

      <div className="space-y-6">
        {grouped.map(([corridor, rows]) => (
          <section key={corridor}>
            <h2 className="mb-3 text-sm font-semibold">{corridor}</h2>
            <div className="space-y-3">
              {rows.map((cluster) => (
                <label
                  key={cluster.cluster_id}
                  className="flex cursor-pointer gap-3 rounded-card border border-civic-line bg-civic-surface p-4"
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selected.includes(cluster.cluster_id)}
                    onChange={() => toggle(cluster.cluster_id)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{cluster.category_label}</p>
                      <StatusBadge verified />
                    </div>
                    <p className="mt-1 text-sm text-civic-slate">
                      {cluster.ward_name} · {cluster.report_count} reports ·{" "}
                      {formatCoords(cluster.lat, cluster.lng)}
                    </p>
                    <p className="text-xs text-civic-muted">
                      {cluster.verification_status}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
