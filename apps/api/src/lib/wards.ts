/**
 * Approximate Kilimani / Dagoretti North planning sub-areas for ward-level
 * dashboard metrics (MVP bounding boxes — replace with official ward polygons later).
 */
export interface WardZone {
  id: string;
  name: string;
  /** [minLat, maxLat, minLng, maxLng] */
  bbox: [number, number, number, number];
}

export const KILIMANI_WARDS: WardZone[] = [
  {
    id: "kilimani-central",
    name: "Kilimani Central",
    bbox: [-1.2985, -1.2885, 36.7780, 36.7900],
  },
  {
    id: "yaya-argwings",
    name: "Yaya / Argwings Kodhek",
    bbox: [-1.3020, -1.2920, 36.7680, 36.7820],
  },
  {
    id: "statehouse-area",
    name: "State House Area",
    bbox: [-1.2900, -1.2780, 36.7900, 36.8050],
  },
  {
    id: "woodley-ngong",
    name: "Woodley / Ngong Road",
    bbox: [-1.3100, -1.2980, 36.7750, 36.7920],
  },
  {
    id: "kileleshwa-edge",
    name: "Kileleshwa Edge",
    bbox: [-1.2920, -1.2800, 36.7680, 36.7850],
  },
];

export function wardForCoordinates(lat: number, lng: number): WardZone {
  for (const ward of KILIMANI_WARDS) {
    const [minLat, maxLat, minLng, maxLng] = ward.bbox;
    if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
      return ward;
    }
  }
  return {
    id: "kilimani-wider",
    name: "Kilimani Wider Catchment",
    bbox: [-1.32, -1.27, 36.76, 36.81],
  };
}
