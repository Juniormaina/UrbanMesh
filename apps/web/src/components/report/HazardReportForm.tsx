import { useState, type FormEvent } from "react";
import { cellForLatLng } from "../../lib/geo";
import {
  HAZARD_OPTIONS,
  type HazardCategoryValue,
} from "../../lib/categories";
import { submitHazardReport, type ReportResponse } from "../../lib/api";

interface Coords {
  lat: number;
  lng: number;
}

export function HazardReportForm() {
  const [category, setCategory] = useState<HazardCategoryValue | "">("");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReportResponse | null>(null);

  function captureLocation() {
    setError(null);
    setResult(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported on this device.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Enable GPS to report."
            : "Could not get your location. Try again outdoors.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!category) {
      setError("Choose a hazard type.");
      return;
    }
    if (!description.trim()) {
      setError("Add a short description.");
      return;
    }
    if (!coords) {
      setError("Capture your location before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitHazardReport({
        category,
        description: description.trim(),
        lat: coords.lat,
        lng: coords.lng,
        h3_index: cellForLatLng(coords.lat, coords.lng),
      });
      setResult(response);
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-civic-line sm:p-5">
      <header className="mb-4">
        <h2 className="font-display text-xl font-semibold text-civic-ink sm:text-2xl">
          Report a hazard
        </h2>
        <p className="mt-1 text-sm font-medium text-civic-slate/80">
          Pin your spot, pick the issue, send it to Nairobi County planners.
        </p>
      </header>

      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <label
            htmlFor="hazard-category"
            className="mb-1.5 block text-sm font-bold text-civic-ink"
          >
            Hazard type
          </label>
          <select
            id="hazard-category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as HazardCategoryValue | "")
            }
            className="w-full rounded-xl border-2 border-civic-line bg-civic-paper px-3 py-3 text-base font-semibold text-civic-ink outline-none focus:border-civic-accent"
          >
            <option value="">Select hazard…</option>
            {HAZARD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="hazard-description"
            className="mb-1.5 block text-sm font-bold text-civic-ink"
          >
            What are you seeing?
          </label>
          <textarea
            id="hazard-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Open manhole near the Argwings Kodhek pedestrian crossing"
            className="w-full resize-none rounded-xl border-2 border-civic-line bg-civic-paper px-3 py-3 text-base font-medium text-civic-ink placeholder:text-civic-slate/45 outline-none focus:border-civic-accent"
          />
        </div>

        <div className="rounded-xl bg-civic-mist/70 p-3 ring-1 ring-civic-line">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold text-civic-ink">Your location</p>
              {coords ? (
                <p className="mt-0.5 truncate font-mono text-xs font-semibold text-civic-slate">
                  {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                </p>
              ) : (
                <p className="mt-0.5 text-xs font-medium text-civic-slate/70">
                  GPS not captured yet
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={captureLocation}
              disabled={locating}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-civic-slate px-4 text-sm font-extrabold text-white transition active:scale-[0.98] disabled:opacity-60"
            >
              {locating ? "Locating…" : coords ? "Refresh GPS" : "Use my location"}
            </button>
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-xl bg-civic-alert/10 px-3 py-2 text-sm font-bold text-civic-alert"
          >
            {error}
          </p>
        ) : null}

        {result ? (
          <p
            role="status"
            className="rounded-xl bg-civic-accent/10 px-3 py-2 text-sm font-bold text-civic-accentDark"
          >
            {result.status === "Verified Cluster Created"
              ? "Verified cluster created — nearby reports confirmed this hazard."
              : "Report logged — pending more nearby confirmations."}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-civic-accent text-base font-extrabold text-white shadow-card transition hover:bg-civic-accentDark active:scale-[0.99] disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Submit report"}
        </button>
      </form>
    </section>
  );
}
