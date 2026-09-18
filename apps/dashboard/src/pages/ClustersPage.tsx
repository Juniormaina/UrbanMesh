import { useEffect, useState } from "react";
import { fetchClusters, type SpatialCluster } from "../lib/api";
import { formatCoords, formatWhen } from "../lib/format";
import { StatusBadge } from "../components/ui/Primitives";

export function ClustersPage() {
  const [clusters, setClusters] = useState<SpatialCluster[]>([]);

  useEffect(() => {
    void fetchClusters().then(setClusters);
  }, []);

  return (
    <div className="p-5 lg:p-7">
      <h1 className="text-2xl font-semibold tracking-tight">Verified clusters</h1>
      <p className="mt-1 text-sm text-civic-muted">
        Same-category reports within 15 metres, confirmed by at least three residents.
      </p>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {clusters.map((cluster) => (
          <article
            key={cluster.cluster_id}
            className="rounded-card border border-civic-line bg-civic-surface p-4 shadow-card"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-civic-muted">
              {cluster.corridor}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{cluster.category_label}</h2>
            <div className="mt-2">
              <StatusBadge verified />
            </div>
            <p className="mt-3 text-sm text-civic-slate">
              {cluster.report_count} reports · {cluster.radius_meters}m radius
            </p>
            <p className="text-sm text-civic-muted">{cluster.ward_name}</p>
            <p className="font-mono text-xs text-civic-muted">
              {formatCoords(cluster.lat, cluster.lng)}
            </p>
            <p className="mt-2 text-xs text-civic-muted">
              First {formatWhen(cluster.first_reported)} · Latest{" "}
              {formatWhen(cluster.latest_report)}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
