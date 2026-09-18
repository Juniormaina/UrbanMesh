import { useEffect, useState } from "react";
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
  fetchMeta,
  fetchReports,
  type DashboardMetrics,
  type IncidentPublic,
  type PlatformMeta,
  type SpatialCluster,
} from "../lib/api";
import { MONTH_LABEL } from "../lib/format";
import { Panel, StatCard } from "../components/ui/Primitives";
import { DEFAULT_LAYERS, PlannerMap } from "../components/map/PlannerMap";
import { useChartColors } from "../lib/theme";

export function OverviewPage() {
  const chart = useChartColors();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [incidents, setIncidents] = useState<IncidentPublic[]>([]);
  const [clusters, setClusters] = useState<SpatialCluster[]>([]);
  const [meta, setMeta] = useState<PlatformMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchDashboardMetrics(),
      fetchReports({ status: "all" }),
      fetchClusters(),
      fetchMeta(),
    ])
      .then(([m, reports, cls, platform]) => {
        setMetrics(m);
        setIncidents(reports);
        setClusters(cls);
        setMeta(platform);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load overview.");
      });
  }, []);

  if (error) {
    return <p className="p-6 text-sm font-semibold text-civic-critical">{error}</p>;
  }
  if (!metrics) {
    return <p className="p-6 text-sm text-civic-muted">Loading Kilimani evidence…</p>;
  }

  return (
    <div className="p-5 lg:p-7">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-civic-muted">
          Nairobi City County · {MONTH_LABEL}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Kilimani walkability intelligence
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-civic-slate">
          Citizen reports become nearby evidence, then verified spatial clusters,
          then LPDP planning inputs. This console reads the live Kilimani dataset.
        </p>
      </header>

      <ol className="mb-6 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-civic-muted">
        {[
          "Citizen report",
          "Nearby reports",
          "Verified cluster",
          "Walkability intelligence",
          "County planning evidence",
        ].map((step, i) => (
          <li key={step} className="rounded-full bg-civic-mist px-3 py-1 text-civic-slate">
            {i + 1}. {step}
          </li>
        ))}
      </ol>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total reports" value={metrics.totals.all} />
        <StatCard label="Verified clusters" value={metrics.totals.clusters} />
        <StatCard label="Pending reports" value={metrics.totals.unverified} />
        <StatCard label="Affected areas" value={metrics.totals.affected_areas} />
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        <div className="h-[420px] overflow-hidden rounded-card border border-civic-line xl:col-span-3">
          <PlannerMap
            incidents={incidents}
            clusters={clusters}
            meta={meta}
            layers={DEFAULT_LAYERS}
          />
        </div>
        <div className="space-y-5 xl:col-span-2">
          <Panel title="Hazard-category distribution" hint="All citizen reports">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.by_category}
                  layout="vertical"
                  margin={{ left: 8, right: 12 }}
                >
                  <CartesianGrid stroke={chart.line} horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: chart.muted }} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={118}
                    tick={{ fontSize: 11, fill: chart.muted }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill={chart.accent} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Daily reporting trend" hint="Total vs verified, Africa/Nairobi dates">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.trend}>
                <CartesianGrid stroke={chart.line} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: chart.muted }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: chart.muted }} />
                <Tooltip />
                <Line dataKey="total" name="Total" stroke={chart.ink} strokeWidth={2} dot={false} />
                <Line dataKey="verified" name="Verified" stroke={chart.accent} strokeWidth={2} dot={false} />
                <Line dataKey="unverified" name="Pending" stroke={chart.pending} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Ward distribution" hint="Approximate Kilimani planning boxes">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.by_ward} margin={{ bottom: 36 }}>
                <CartesianGrid stroke={chart.line} />
                <XAxis dataKey="ward_name" tick={{ fontSize: 10, fill: chart.muted }} interval={0} angle={-24} textAnchor="end" />
                <YAxis allowDecimals={false} tick={{ fill: chart.muted }} />
                <Tooltip />
                <Bar dataKey="verified" name="Verified" stackId="a" fill={chart.accent} />
                <Bar dataKey="unverified" name="Pending" stackId="a" fill={chart.pending} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </div>
  );
}
