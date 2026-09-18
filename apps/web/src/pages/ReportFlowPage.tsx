import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { cellForLatLng } from "../lib/geo";
import {
  submitHazardReport,
  uploadPhoto,
  type ReportResponse,
} from "../lib/api";
import {
  HAZARD_OPTIONS,
  type HazardCategoryValue,
} from "../lib/categories";
import { CategoryIcon } from "../components/ui/StatusBadge";
import { CameraCapture } from "../components/report/CameraCapture";
import { KILIMANI_CENTER } from "../components/map/LiveMap";
import { formatCoords } from "../lib/format";
import { rememberMyReport } from "../lib/myReports";
import { useLocationState } from "../lib/location";
import { UrbanMeshLogo } from "../components/ui/UrbanMeshLogo";
import { ErrorBanner } from "../components/ui/ReportCard";
import { ThemeToggle, useTheme } from "../lib/theme";
import { tilesFor } from "../lib/mapStyle";

export function ReportFlowPage() {
  const navigate = useNavigate();
  const { coords, requestLocation, locating, error: locationError } = useLocationState();
  const { dark } = useTheme();
  const tiles = tilesFor(dark);
  const [step, setStep] = useState(1);
  const [center, setCenter] = useState(
    coords ?? { lat: KILIMANI_CENTER[0], lng: KILIMANI_CENTER[1] },
  );
  const [category, setCategory] = useState<HazardCategoryValue | "">("");
  const [description, setDescription] = useState("");
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReportResponse | null>(null);

  const selected = HAZARD_OPTIONS.find((o) => o.value === category);

  useEffect(() => {
    if (coords) setCenter(coords);
  }, [coords]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!category) return;
    setSubmitting(true);
    setError(null);
    try {
      let photo_url: string | null = null;
      if (photoData) photo_url = await uploadPhoto(photoData);
      const response = await submitHazardReport({
        category,
        description: description.trim(),
        lat: center.lat,
        lng: center.lng,
        h3_index: cellForLatLng(center.lat, center.lng),
        photo_url,
      });
      rememberMyReport(response.incident_id);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-lg flex-col overflow-hidden bg-civic-paper">
      <header className="flex items-center justify-between border-b border-civic-line bg-civic-surface px-4 py-2.5">
        <button
          type="button"
          onClick={() => (step > 1 && !result ? setStep(step - 1) : navigate(-1))}
          className="text-sm font-semibold text-civic-slate"
        >
          Back
        </button>
        <UrbanMeshLogo compact />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <span className="text-xs font-semibold tabular-nums text-civic-muted">
            {result ? "Submitted" : `${step} / 4`}
          </span>
        </div>
      </header>

      {result ? (
        <ResultState result={result} />
      ) : (
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
          {step === 1 ? (
            <section className="flex min-h-0 flex-1 flex-col">
              <div className="px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-civic-muted">
                  1 · Location
                </p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight">
                  Where is the problem?
                </h1>
                <p className="mt-1 text-sm text-civic-muted">
                  Pan the map so the crosshair sits on the hazard.
                </p>
              </div>
              <div className="relative min-h-[320px] flex-1">
                <div className="absolute inset-0">
                <MapContainer
                  center={[center.lat, center.lng]}
                  zoom={17}
                  className="h-full w-full"
                  scrollWheelZoom
                >
                  <TileLayer
                    key={dark ? "dark" : "light"}
                    url={tiles.url}
                    attribution={tiles.attribution}
                  />
                  <MoveTracker onMove={setCenter} />
                  {coords ? <FlyTo lat={coords.lat} lng={coords.lng} /> : null}
                </MapContainer>
                </div>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative um-crosshair" />
                </div>
              </div>
              <div className="space-y-3 border-t border-civic-line bg-civic-surface px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-civic-muted">
                  Selected location
                </p>
                <p className="font-mono text-xs text-civic-slate">
                  {formatCoords(center.lat, center.lng)}
                </p>
                {locating ? (
                  <p className="text-sm text-civic-muted">Reading GPS…</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    requestLocation();
                    if (coords) setCenter(coords);
                  }}
                  className="w-full min-h-12 rounded-card border border-civic-line py-3 text-sm font-semibold"
                >
                  {locating ? "Locating…" : "Use my location"}
                </button>
                {locationError ? (
                  <p className="text-sm font-semibold text-civic-critical">{locationError}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full min-h-12 rounded-card bg-civic-accent py-3 text-sm font-semibold text-white"
                >
                  Confirm location
                </button>
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="flex-1 overflow-y-auto px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-civic-muted">
                2 · Hazard
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">
                What is the problem?
              </h1>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {HAZARD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategory(opt.value)}
                    className={`min-h-[7.5rem] rounded-card border p-4 text-left ${
                      category === opt.value
                        ? "border-civic-ink bg-civic-mist"
                        : "border-civic-line bg-civic-surface"
                    }`}
                  >
                    <CategoryIcon
                      category={opt.value}
                      className="h-6 w-6 text-civic-accent"
                    />
                    <p className="mt-3 text-sm font-semibold">{opt.label}</p>
                    <p className="mt-1 text-xs text-civic-muted">{opt.hint}</p>
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={!category}
                onClick={() => setStep(3)}
                className="mt-5 w-full rounded-card bg-civic-accent py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                Continue
              </button>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="flex-1 overflow-y-auto px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-civic-muted">
                3 · Evidence
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">Add evidence</h1>
              <p className="mt-1 text-sm text-civic-muted">
                Photograph the hazard now. Gallery uploads are not accepted.
              </p>
              <label className="mt-4 block text-sm font-semibold">Photo</label>
              <div className="mt-2">
                <CameraCapture
                  photoData={photoData}
                  onCapture={setPhotoData}
                  onRetake={() => setPhotoData(null)}
                />
              </div>
              <label className="mt-5 block text-sm font-semibold" htmlFor="desc">
                Short description
              </label>
              <textarea
                id="desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Open manhole on Argwings Kodhek pedestrian verge, no barrier."
                className="mt-2 w-full rounded-card border border-civic-line bg-civic-surface px-3 py-3 text-sm outline-none focus:border-civic-accent"
              />
              <p className="mt-3 text-xs font-medium text-civic-muted">
                Detected location · {formatCoords(center.lat, center.lng)}
              </p>
              <button
                type="button"
                disabled={!description.trim() || !photoData}
                onClick={() => setStep(4)}
                className="mt-5 w-full rounded-card bg-civic-accent py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                Review
              </button>
            </section>
          ) : null}

          {step === 4 ? (
            <section className="flex-1 overflow-y-auto px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-civic-muted">
                4 · Review
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">Review and submit</h1>
              <dl className="mt-4 space-y-3 rounded-card border border-civic-line bg-civic-surface p-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-civic-muted">
                    Location
                  </dt>
                  <dd className="mt-1 font-medium">{formatCoords(center.lat, center.lng)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-civic-muted">
                    Hazard
                  </dt>
                  <dd className="mt-1 font-medium">{selected?.label}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-civic-muted">
                    Evidence
                  </dt>
                  <dd className="mt-1 font-medium">{description}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-civic-muted">
                    Photo
                  </dt>
                  <dd className="mt-1">
                    {photoData ? (
                      <img
                        src={photoData}
                        alt="Captured hazard evidence"
                        className="max-h-40 w-full rounded-card object-cover"
                      />
                    ) : (
                      <span className="font-medium">Not taken</span>
                    )}
                  </dd>
                </div>
              </dl>
              {error ? <div className="mt-3"><ErrorBanner message={error} /></div> : null}
              <button
                type="submit"
                disabled={submitting}
                className="mt-5 w-full rounded-card bg-civic-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Submit report"}
              </button>
            </section>
          ) : null}
        </form>
      )}
    </div>
  );
}

function MoveTracker({
  onMove,
}: {
  onMove: (coords: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    moveend(e) {
      const c = e.target.getCenter();
      onMove({ lat: c.lat, lng: c.lng });
    },
  });
  return null;
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 17, { duration: 0.6 });
  }, [map, lat, lng]);
  return null;
}

function ResultState({ result }: { result: ReportResponse }) {
  const verified = result.is_verified;
  return (
    <div className="um-enter flex flex-1 flex-col px-5 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-civic-muted">
        5 · Submission
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {verified ? "Community verified" : "Report logged"}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-civic-slate">
        {verified
          ? `${Math.max(result.nearby_count, 3)} nearby reports confirm this hazard.`
          : "Waiting for nearby reports to confirm this hazard."}
      </p>
      <p className="mt-6 text-sm leading-relaxed text-civic-muted">
        This is {verified ? "a verified spatial cluster" : "an individual report"}.
        Three same-category sightings within 15 metres become planning evidence.
      </p>
      <Link
        to={`/hazards/${result.incident_id}`}
        className="mt-8 rounded-card bg-civic-accent py-3 text-center text-sm font-semibold text-white"
      >
        View evidence
      </Link>
      <Link
        to="/"
        className="mt-3 rounded-card border border-civic-line py-3 text-center text-sm font-semibold"
      >
        Back to map
      </Link>
    </div>
  );
}
