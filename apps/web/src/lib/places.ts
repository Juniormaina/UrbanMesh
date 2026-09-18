export interface KilimaniPlace {
  name: string;
  hint: string;
  lat: number;
  lng: number;
}

/** Named Kilimani search points — no general web geocoder. */
export const KILIMANI_PLACES: KilimaniPlace[] = [
  { name: "Kilimani", hint: "Planning area", lat: -1.2921, lng: 36.785 },
  {
    name: "Argwings Kodhek Road",
    hint: "Pilot corridor",
    lat: -1.2945,
    lng: 36.7885,
  },
  {
    name: "Dennis Pritt Road",
    hint: "Pedestrian corridor",
    lat: -1.2934,
    lng: 36.7886,
  },
  { name: "Ngong Road", hint: "Carriageway", lat: -1.299, lng: 36.788 },
  {
    name: "Kirichwa Kubwa",
    hint: "Drainage / sanitation",
    lat: -1.2948,
    lng: 36.7814,
  },
  { name: "Yaya Centre", hint: "Landmark", lat: -1.2928, lng: 36.7882 },
];

export function searchKilimaniPlaces(query: string): KilimaniPlace[] {
  const needle = query.trim().toLowerCase();
  if (needle.length < 2) return [];
  return KILIMANI_PLACES.filter(
    (place) =>
      place.name.toLowerCase().includes(needle) ||
      place.hint.toLowerCase().includes(needle),
  );
}