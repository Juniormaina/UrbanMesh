import { latLngToCell } from "h3-js";

/** Street-scale H3 resolution (roadmap Wk 2 — live client-side cells). */
const H3_RESOLUTION = Number(import.meta.env.VITE_H3_RESOLUTION ?? 10);

export function cellForLatLng(lat: number, lng: number): string {
  return latLngToCell(lat, lng, Number.isFinite(H3_RESOLUTION) ? H3_RESOLUTION : 10);
}
