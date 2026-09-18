import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchClusters,
  fetchDashboardMetrics,
  type DashboardMetrics,
  type SpatialCluster,
} from "../lib/api";
import { Panel } from "../components/ui/Primitives";
import { useChartColors } from "../lib/theme";

export function AnalyticsPage() {
  const chart = useChartColors();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [clusters, setClusters] = useState<SpatialCluster[]>([]);

  useEffect(() => {
    void Promise.all([fetchDashboardMetrics(), fetchClusters()]).then(
      ([m, c]) => {
        setMetrics(m);
        setClusters(c);
      },
    );
  }, []);

  const emerging = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return clusters.filter(
      (c) => new Date(c.latest_report).getTime() >= weekAgo,
    );
  }, [clusters]);

  if (!metrics) {
    return <p className="p-6 text-sm text-civic-muted">Loading analytics…</p>;
  }

  const ratio =
    metrics.totals.all === 0
      ? 0
      : Math.round((metrics.totals.verified / metrics.totals.all) * 100);

  return (
    <div className="p-5 lg:p-7">
      <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
      <p className="mt-1 text-sm text-civic-muted">
        How Kilimani reports concentrate, verify, and emerge along pilot corridors.
      </p>

      <p className="mt-5 text-sm">
        Verification ratio: <strong>{ratio}%</strong> of reports sit inside a
        confirmed 15 m cluster.
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Reports over time">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.trend}>
                <CartesianGrid stroke={chart.line} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: chart.muted }} />
                <YAxis allowDecimals={false} tick={{ fill: chart.muted }} />
                <Tooltip />
                <Line dataKey="total" stroke={chart.ink} strokeWidth={2} dot={false} />
                <Line dataKey="verified" stroke={chart.accent} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Hazards by category">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.by_category} layout="vertical">
                <CartesianGrid stroke={chart.line} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: chart.muted }} />
                <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 11, fill: chart.muted }} />
                <Tooltip />
                <Bar dataKey="count" fill={chart.accent} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Hazards by ward">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.by_ward}>
                <CartesianGrid stroke={chart.line} />
                <XAxis dataKey="ward_name" tick={{ fontSize: 10, fill: chart.muted }} interval={0} angle={-20} textAnchor="end" height={56} />
                <YAxis allowDecimals={false} tick={{ fill: chart.muted }} />
                <Tooltip />
                <Bar dataKey="total" fill={chart.ink} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel
          title="High-density corridors"
          hint="Verified reports grouped by named Kilimani corridor"
        >
          <ul className="space-y-3">
            {metrics.by_corridor.map((row) => (
              <li key={row.corridor} className="flex items-center justify-between text-sm">
                <span className="font-medium">{row.corridor}</span>
                <span className="text-civic-muted">
                  {row.verified} verified · {row.total} total
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel
        title="Emerging clusters"
        hint="Verified clusters with a report in the last 7 days"
      >
        <ul className="mt-2 divide-y divide-civic-mist">
          {emerging.length === 0 ? (
            <li className="py-3 text-sm text-civic-muted">
              No newly active clusters this week.
            </li>
          ) : (
            emerging.map((c) => (
              <li key={c.cluster_id} className="flex justify-between py-3 text-sm">
                <span className="font-medium">
                  {c.category_label} · {c.corridor}
                </span>
                <span className="text-civic-muted">{c.report_count} reports</span>
              </li>
            ))
          )}
        </ul>
      </Panel>
    </div>
  );
}
