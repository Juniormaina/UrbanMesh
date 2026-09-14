export const HAZARD_OPTIONS = [
  {
    value: "MOBILITY_SURFACE_DAMAGE",
    label: "Pothole / Broken Road Surface",
  },
  {
    value: "NMT_PEDESTRIAN_HAZARD",
    label: "Blocked Walkway / Pedestrian Barrier",
  },
  {
    value: "DRAINAGE_STORMWATER",
    label: "Flooding / Clogged Drain",
  },
  {
    value: "SEWER_SANITATION",
    label: "Open Manhole / Sewer Leak",
  },
  {
    value: "LIGHTING_SECURITY",
    label: "Unlit Street / Broken Light",
  },
  {
    value: "ILLEGAL_WASTE_DUMP",
    label: "Illegal Dumping / Waste Pile",
  },
] as const;

export type HazardCategoryValue = (typeof HAZARD_OPTIONS)[number]["value"];

export function labelForCategory(value: string): string {
  return HAZARD_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
