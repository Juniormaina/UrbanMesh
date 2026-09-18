export const HAZARD_OPTIONS = [
  {
    value: "MOBILITY_SURFACE_DAMAGE",
    label: "Road damage",
    hint: "Potholes, cracked asphalt, broken paving",
  },
  {
    value: "NMT_PEDESTRIAN_HAZARD",
    label: "Blocked walkway",
    hint: "Obstructed sidewalks and pedestrian barriers",
  },
  {
    value: "DRAINAGE_STORMWATER",
    label: "Flooding / drainage",
    hint: "Clogged drains and standing water",
  },
  {
    value: "SEWER_SANITATION",
    label: "Sewer / sanitation",
    hint: "Open manholes and sewer leaks",
  },
  {
    value: "LIGHTING_SECURITY",
    label: "Broken lighting",
    hint: "Unlit streets and dead lamps",
  },
  {
    value: "ILLEGAL_WASTE_DUMP",
    label: "Illegal dumping",
    hint: "Waste piles blocking mobility paths",
  },
] as const;

export type HazardCategoryValue = (typeof HAZARD_OPTIONS)[number]["value"];

export function labelForCategory(value: string): string {
  return HAZARD_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function isCriticalCategory(value: string): boolean {
  return value === "SEWER_SANITATION" || value === "DRAINAGE_STORMWATER";
}
