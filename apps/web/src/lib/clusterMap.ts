import type { IncidentPublic } from "./api";

export interface VerifiedClusterPin {
  clusterId: string;
  lat: number;
  lng: number;
  category: string;
  category_label: string;
  severity: "critical" | "standard";
  corridor: string;
  report_count: number;
  representativeId: string;
}

export function splitMapFeatures(incidents: IncidentPublic[]): {
  clusters: VerifiedClusterPin[];
  pending: IncidentPublic[];
  ungroupedVerified: IncidentPublic[];
} {
  const pending = incidents.filter((row) => !row.is_verified);
  const grouped = new Map<string, IncidentPublic[]>();
  const ungroupedVerified: IncidentPublic[] = [];

  for (const row of incidents) {
    if (!row.is_verified) continue;
    if (!row.cluster_id) {
      ungroupedVerified.push(row);
      continue;
    }
    const list = grouped.get(row.cluster_id) ?? [];
    list.push(row);
    grouped.set(row.cluster_id, list);
  }

  const clusters: VerifiedClusterPin[] = [...grouped.entries()].map(
    ([clusterId, members]) => {
      const lat =
        members.reduce((sum, row) => sum + row.lat, 0) / members.length;
      const lng =
        members.reduce((sum, row) => sum + row.lng, 0) / members.length;
      const newest = [...members].sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      )[0];
      return {
        clusterId,
        lat,
        lng,
        category: newest.category,
        category_label: newest.category_label,
        severity: members.some((row) => row.severity === "critical")
          ? "critical"
          : "standard",
        corridor: newest.corridor,
        report_count: members.length,
        representativeId: newest.id,
      };
    },
  );

  return { clusters, pending, ungroupedVerified };
}