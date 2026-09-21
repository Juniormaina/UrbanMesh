export const LIGHT_TILES = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};

export const DARK_TILES = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};

export const HEAT_LIGHT = {
  0.2: "#c5d4c8",
  0.45: "#d7c48a",
  0.7: "#c98456",
  1: "#a63d2f",
};

export const HEAT_DARK = {
  0.2: "#3d5c52",
  0.45: "#c4a15a",
  0.7: "#c98456",
  1: "#c56a58",
};

export const MARKER = {
  pending: "#C4923A",
  verified: "#3F8A74",
  critical: "#C56A58",
  you: "#4C8DFF",
};

export function tilesFor(dark: boolean) {
  return dark ? DARK_TILES : LIGHT_TILES;
}
