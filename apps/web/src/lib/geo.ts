import { latLngToCell } from "h3-js";

/** Street-scale H3 resolution for Kilimani hazard clustering. */
const H3_RESOLUTION = 10;

export function cellForLatLng(lat: number, lng: number): string {
  return latLngToCell(lat, lng, H3_RESOLUTION);
}
