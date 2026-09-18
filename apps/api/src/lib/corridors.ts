import { haversineMeters } from "./geo.js";

export interface CorridorPath {
  id: string;
  name: string;
  focus: string;
  path: Array<[number, number]>;
}

/** Sketch polylines for Kilimani pilot corridors (planning map layers). */
export const PILOT_CORRIDORS: CorridorPath[] = [
  {
    id: "argwings-kodhek",
    name: "Argwings Kodhek Road",
    focus: "Mobility and surface damage",
    path: [
      [-1.2972, 36.7825],
      [-1.2958, 36.7858],
      [-1.2945, 36.7885],
      [-1.2932, 36.7912],
      [-1.2920, 36.7938],
    ],
  },
  {
    id: "dennis-pritt",
    name: "Dennis Pritt Road",
    focus: "Lighting and pedestrian safety",
    path: [
      [-1.2915, 36.7860],
      [-1.2928, 36.7878],
      [-1.2940, 36.7895],
      [-1.2952, 36.7910],
    ],
  },
  {
    id: "ngong-road",
    name: "Ngong Road",
    focus: "Stormwater and carriageway hazards",
    path: [
      [-1.3015, 36.7810],
      [-1.3002, 36.7845],
      [-1.2990, 36.7880],
      [-1.2978, 36.7915],
      [-1.2965, 36.7950],
    ],
  },
  {
    id: "kirichwa-kubwa",
    name: "Kirichwa Kubwa corridor",
    focus: "Sewer, sanitation and riparian dumping",
    path: [
      [-1.2968, 36.7795],
      [-1.2955, 36.7808],
      [-1.2942, 36.7820],
      [-1.2928, 36.7835],
    ],
  },
];

const MATCH_RADIUS_M = 280;

/** Nearest named Kilimani corridor, or a wider Kilimani fallback. */
export function corridorForCoordinates(lat: number, lng: number): string {
  let best: { name: string; dist: number } | null = null;

  for (const corridor of PILOT_CORRIDORS) {
    for (const [plat, plng] of corridor.path) {
      const dist = haversineMeters(lat, lng, plat, plng);
      if (!best || dist < best.dist) {
        best = { name: corridor.name, dist };
      }
    }
  }

  if (best && best.dist <= MATCH_RADIUS_M) return best.name;
  return "Kilimani";
}
