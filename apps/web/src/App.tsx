import { lazy, Suspense } from "react";
import { HazardReportForm } from "./components/report/HazardReportForm";
import { UrbanMeshLogo } from "./components/ui/UrbanMeshLogo";

/** Lazy-load Leaflet + heat plugin so the report form paints first on slow networks. */
const SafetyHeatmap = lazy(() =>
  import("./components/map/SafetyHeatmap").then((m) => ({
    default: m.SafetyHeatmap,
  })),
);

function MapSkeleton() {
  return (
    <div className="flex h-[min(58vh,420px)] items-center justify-center rounded-2xl bg-white shadow-card ring-1 ring-civic-line">
      <p className="text-sm font-bold text-civic-slate">Loading live map…</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-4 pb-10 pt-5 sm:px-6 sm:pt-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="sr-only">UrbanMesh</h1>
        <UrbanMeshLogo />
      </header>

      <main className="flex flex-col gap-5 sm:gap-6">
        <HazardReportForm />
        <Suspense fallback={<MapSkeleton />}>
          <SafetyHeatmap />
        </Suspense>
      </main>
    </div>
  );
}
