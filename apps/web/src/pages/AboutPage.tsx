import { Link } from "react-router-dom";
import { PipelineStrip } from "../components/ui/Pipeline";

export function AboutPage() {
  return (
    <article className="um-enter mx-auto w-full max-w-[960px] px-4 py-6 pb-10 lg:px-6 lg:py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-civic-muted">
        Kilimani · Nairobi City County
      </p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight lg:text-3xl">About UrbanMesh</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-civic-slate lg:text-base">
        Residents report what they see. UrbanMesh verifies spatial patterns.
        Planners receive structured evidence for Kilimani’s Local Physical
        Development Plan. There is no public profile on this phone — reports you
        submit stay on this device.
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">How a report becomes evidence</h2>
        <div className="mt-3">
          <PipelineStrip />
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <section>
        <h2 className="text-sm font-semibold">How verification works</h2>
        <ol className="mt-3 space-y-3 text-sm leading-relaxed text-civic-slate">
          <li>1. A resident reports a hazard on Kilimani streets.</li>
          <li>2. Nearby reports of the same type become evidence — not likes.</li>
          <li>3. Three reports within 15 m verify a spatial cluster.</li>
          <li>4. Only verified clusters feed the walkability heatmap.</li>
          <li>5. Nairobi County uses them as LPDP planning evidence.</li>
        </ol>
      </section>

      <section className="rounded-card border border-civic-line bg-civic-surface p-4">
        <h2 className="text-sm font-semibold">What you will see on the map</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-civic-slate">
          <li>
            <span className="font-semibold text-civic-ink">Pending</span> — an
            individual report, still waiting for nearby confirmation.
          </li>
          <li>
            <span className="font-semibold text-civic-ink">Community verified</span>{" "}
            — three or more same-category reports within 15 metres.
          </li>
        </ul>
      </section>
      </div>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Link
          to="/report"
          className="inline-flex min-h-12 items-center justify-center rounded-card bg-civic-accent px-4 text-sm font-semibold text-white"
        >
          Report a hazard
        </Link>
        <Link
          to="/"
          className="inline-flex min-h-12 items-center justify-center rounded-card border border-civic-line px-4 text-sm font-semibold"
        >
          Open the map
        </Link>
      </div>
    </article>
  );
}