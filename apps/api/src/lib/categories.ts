export const HAZARD_LABELS: Record<string, string> = {
  MOBILITY_SURFACE_DAMAGE: "Pothole / Broken Road Surface",
  NMT_PEDESTRIAN_HAZARD: "Blocked Walkway / Pedestrian Barrier",
  DRAINAGE_STORMWATER: "Flooding / Clogged Drain",
  SEWER_SANITATION: "Open Manhole / Sewer Leak",
  LIGHTING_SECURITY: "Unlit Street / Broken Light",
  ILLEGAL_WASTE_DUMP: "Illegal Dumping / Waste Pile",
};

export function labelForCategory(category: string): string {
  return HAZARD_LABELS[category] ?? category;
}
