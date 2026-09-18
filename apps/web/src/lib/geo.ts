import { latLngToCell } from "h3-js";

/** Street-scale H3 resolution (roadmap Wk 2 — live client-side cells). */
const H3_RESOLUTION = Number(import.meta.env.VITE_H3_RESOLUTION ?? 10);

export function cellForLatLng(lat: number, lng: number): string {
  return latLngToCell(lat, lng, Number.isFinite(H3_RESOLUTION) ? H3_RESOLUTION : 10);
}

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
