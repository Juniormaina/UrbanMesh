import type { HazardCategoryValue } from "./categories";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export interface ReportPayload {
  category: HazardCategoryValue;
  description: string;
  lat: number;
  lng: number;
  h3_index: string;
  photo_url?: string | null;
}

export interface ReportResponse {
  status: "Verified Cluster Created" | "Incident Logged - Pending Verification";
  incident_id: string;
  cluster_id: string | null;
  is_verified: boolean;
  nearby_count: number;
}

export interface VerifiedIncident {
  id: string;
  category: string;
  description: string;
  lat: number;
  lng: number;
  h3_index: string;
  cluster_id: string | null;
  is_verified: boolean;
}

export async function submitHazardReport(
  payload: ReportPayload,
): Promise<ReportResponse> {
  const res = await fetch(`${API_BASE}/api/v1/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? `Report failed (${res.status})`);
  }

  return res.json() as Promise<ReportResponse>;
}

export async function fetchVerifiedIncidents(): Promise<VerifiedIncident[]> {
  const res = await fetch(`${API_BASE}/api/v1/reports/verified`);

  if (!res.ok) {
    throw new Error(`Could not load verified incidents (${res.status})`);
  }

  const data = (await res.json()) as {
    count: number;
    incidents: VerifiedIncident[];
  };
  return data.incidents ?? [];
}
