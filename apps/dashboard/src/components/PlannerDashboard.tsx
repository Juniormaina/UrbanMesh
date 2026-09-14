import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchDashboardMetrics,
  generateLpdpBrief,
  LPDP_DOWNLOAD_HREF,
  type DashboardMetrics,
} from "../lib/api";
import { UrbanMeshLogo } from "./ui/UrbanMeshLogo";

const PIE_COLORS = ["#0E7C6B", "#B07D1A"];

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "verified" | "pending" | "default";
}) {
  const toneClass =
    tone === "verified"
      ? "text-civic-verified"
      : tone === "pending"
        ? "text-civic-pending"
        : "text-civic-ink";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-civic-line">
      <p className="text-xs font-extrabold uppercase tracking-wide text-civic-slate/70">
        {label}
      </p>
      <p className={`mt-1 font-display text-3xl font-bold ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}

export function PlannerDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genMessage, setGenMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onGeneratePdf() {
    setGenerating(true);
    setGenMessage(null);
    try {
      const result = await generateLpdpBrief();
      setGenMessage(
        `Brief ready — ${result.cluster_count} high-risk cluster${result.cluster_count === 1 ? "" : "s"} compiled.`,
      );
    } catch (err) {
      setGenMessage(
        err instanceof Error ? err.message : "Could not generate LPDP PDF.",
      );
    } finally {
      setGenerating(false);
    }
  }

  const verificationPie = metrics
    ? [
        { name: "Verified", value: metrics.totals.verified },
        { name: "Unverified", value: metrics.totals.unverified },
      ]
    : [];

  return (
    <div className="mx-auto min-h-dvh max-w-6xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <UrbanMeshLogo className="mb-2 [&_span]:text-2xl sm:[&_span]:text-3xl" />
          <p className="mt-2 max-w-2xl text-sm font-semibold text-civic-slate sm:text-base">
            Ward-level mobility hazard metrics for Kilimani — feed directly into
            Local Physical Development Plan prioritisation.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void onGeneratePdf()}
              disabled={generating}
              className="min-h-11 rounded-xl bg-civic-accent px-4 text-sm font-extrabold text-white hover:bg-civic-accentDark disabled:opacity-60"
            >
              {generating ? "Generating…" : "Generate LPDP PDF"}
            </button>
            <a
              href={LPDP_DOWNLOAD_HREF}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-civic-slate px-4 text-sm font-extrabold text-white hover:bg-civic-ink"
            >
              Download brief
            </a>
            <button
              type="button"
              onClick={() => void load()}
              className="min-h-11 rounded-xl border-2 border-civic-line bg-white px-4 text-sm font-extrabold text-civic-ink"
            >
              Refresh
            </button>
          </div>
          {genMessage ? (
            <p className="text-xs font-bold text-civic-accentDark">{genMessage}</p>
          ) : null}
          <p className="text-[11px] font-semibold text-civic-slate/70">
            File:{" "}
            <code className="rounded bg-civic-mist px-1">
              /api/v1/lpdp/UrbanMesh-LPDP-Policy-Brief.pdf
            </code>
          </p>
        </div>
      </header>

      {error ? (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-civic-alert/10 px-3 py-2 text-sm font-bold text-civic-alert"
        >
          {error}
        </p>
      ) : null}

      {loading && !metrics ? (
        <p className="text-sm font-bold text-civic-slate">Loading metrics…</p>
      ) : null}

      {metrics ? (
        <>
          <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Total reports" value={metrics.totals.all} />
            <StatCard
              label="Verified"
              value={metrics.totals.verified}
              tone="verified"
            />
            <StatCard
              label="Unverified"
              value={metrics.totals.unverified}
              tone="pending"
            />
            <StatCard label="Wards reporting" value={metrics.by_ward.length} />
          </section>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Ward-level stacked bars */}
            <section className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-civic-line sm:p-5">
              <h2 className="font-display text-lg font-semibold text-civic-ink">
                Ward-level incidents
              </h2>
              <p className="mb-3 text-xs font-semibold text-civic-slate/75">
                Verified vs unverified by Kilimani planning area
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.by_ward}
                    margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#C5D5DC" />
                    <XAxis
                      dataKey="ward_name"
                      tick={{ fontSize: 11, fill: "#1C3A4A" }}
                      interval={0}
                      angle={-28}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="verified"
                      name="Verified"
                      stackId="a"
                      fill="#1B7F5A"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="unverified"
                      name="Unverified"
                      stackId="a"
                      fill="#B07D1A"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Category counts */}
            <section className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-civic-line sm:p-5">
              <h2 className="font-display text-lg font-semibold text-civic-ink">
                Counts by hazard category
              </h2>
              <p className="mb-3 text-xs font-semibold text-civic-slate/75">
                All citizen reports, grouped by hazard type
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={metrics.by_category}
                    margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#C5D5DC" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={130}
                      tick={{ fontSize: 10, fill: "#1C3A4A" }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" name="Reports" fill="#0E7C6B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Verified vs unverified pie */}
            <section className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-civic-line sm:p-5">
              <h2 className="font-display text-lg font-semibold text-civic-ink">
                Verification status
              </h2>
              <p className="mb-3 text-xs font-semibold text-civic-slate/75">
                Crowdsource confirmation (≥3 reports / 15 m)
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={verificationPie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      label
                    >
                      {verificationPie.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Trend over time */}
            <section className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-civic-line sm:p-5">
              <h2 className="font-display text-lg font-semibold text-civic-ink">
                Trend over time
              </h2>
              <p className="mb-3 text-xs font-semibold text-civic-slate/75">
                Daily report volume — total, verified, unverified
              </p>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={metrics.trend}
                    margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#C5D5DC" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#1C3A4A" }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total"
                      stroke="#0B1F2A"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="verified"
                      name="Verified"
                      stroke="#1B7F5A"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="unverified"
                      name="Unverified"
                      stroke="#B07D1A"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <p className="mt-4 text-xs font-semibold text-civic-slate/60">
            Metrics as of {new Date(metrics.generated_at).toLocaleString("en-KE")}
          </p>
        </>
      ) : null}
    </div>
  );
}
