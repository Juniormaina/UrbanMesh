import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface Coords {
  lat: number;
  lng: number;
}

interface LocationValue {
  coords: Coords | null;
  locating: boolean;
  error: string | null;
  requestLocation: () => void;
  setCoords: (coords: Coords) => void;
}

const LocationContext = createContext<LocationValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Location is not available on this device.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied."
            : "Could not read GPS. Try outdoors.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, []);

  const value = useMemo(
    () => ({ coords, locating, error, requestLocation, setCoords }),
    [coords, locating, error, requestLocation],
  );

  return createElement(LocationContext.Provider, { value }, children);
}

export function useLocationState(): LocationValue {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocationState must be used within LocationProvider");
  }
  return ctx;
}
