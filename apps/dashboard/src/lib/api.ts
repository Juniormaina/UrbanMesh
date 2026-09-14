const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export interface DashboardMetrics {
  generated_at: string;
  totals: {
    all: number;
    verified: number;
    unverified: number;
  };
  by_category: Array<{
    category: string;
    label: string;
    count: number;
    verified: number;
    unverified: number;
  }>;
  by_ward: Array<{
    ward_id: string;
    ward_name: string;
    total: number;
    verified: number;
    unverified: number;
  }>;
  trend: Array<{
    date: string;
    total: number;
    verified: number;
    unverified: number;
  }>;
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await fetch(`${API_BASE}/api/v1/dashboard/metrics`);
  if (!res.ok) {
    throw new Error(`Failed to load metrics (${res.status})`);
  }
  return res.json() as Promise<DashboardMetrics>;
}

export async function generateLpdpBrief(): Promise<{
  download_url: string;
  cluster_count: number;
  generated_at: string;
}> {
  const res = await fetch(`${API_BASE}/api/v1/lpdp/generate`, {
    method: "POST",
  });
  if (!res.ok) {
    throw new Error(`LPDP generation failed (${res.status})`);
  }
  return res.json();
}

export const LPDP_DOWNLOAD_HREF = `${API_BASE}/api/v1/lpdp/latest.pdf`;
