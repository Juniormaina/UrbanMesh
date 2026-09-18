export const HAZARD_LABELS: Record<string, string> = {
  MOBILITY_SURFACE_DAMAGE: "Road damage",
  NMT_PEDESTRIAN_HAZARD: "Blocked walkway",
  DRAINAGE_STORMWATER: "Flooding / drainage",
  SEWER_SANITATION: "Sewer / sanitation",
  LIGHTING_SECURITY: "Broken lighting",
  ILLEGAL_WASTE_DUMP: "Illegal dumping",
};

export const HAZARD_SEVERITY: Record<string, "critical" | "standard"> = {
  MOBILITY_SURFACE_DAMAGE: "standard",
  NMT_PEDESTRIAN_HAZARD: "standard",
  DRAINAGE_STORMWATER: "critical",
  SEWER_SANITATION: "critical",
  LIGHTING_SECURITY: "standard",
  ILLEGAL_WASTE_DUMP: "standard",
};

export function labelForCategory(category: string): string {
  return HAZARD_LABELS[category] ?? category;
}

export function severityForCategory(
  category: string,
): "critical" | "standard" {
  return HAZARD_SEVERITY[category] ?? "standard";
}
