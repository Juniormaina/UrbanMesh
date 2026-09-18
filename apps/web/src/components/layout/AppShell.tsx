import { Link, NavLink, useLocation } from "react-router-dom";
import { UrbanMeshLogo } from "../ui/UrbanMeshLogo";
import { useLocationState } from "../../lib/location";
import { ThemeToggle } from "../../lib/theme";
import { useState, type ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const scrollable = pathname !== "/";
  return (
    <div className="mx-auto flex h-full max-w-lg flex-col overflow-hidden bg-civic-paper">
      <TopBar />
      <main
        className={`relative min-h-0 flex-1 ${
          scrollable ? "overflow-y-auto" : "overflow-hidden"
        }`}
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

function TopBar() {
  const { requestLocation, locating, coords } = useLocationState();
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-[2000] flex shrink-0 items-center justify-between gap-3 border-b border-civic-line bg-civic-surface px-4 py-2.5">
      <UrbanMeshLogo compact />
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={requestLocation}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-civic-line px-2.5 text-xs font-semibold text-civic-slate"
        >
          {locating ? "Locating…" : coords ? "Located" : "Location"}
        </button>
        <ThemeToggle />
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-civic-line text-civic-ink"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path d="M4 6h12v1.5H4V6zm0 3.25h12v1.5H4v-1.5zM4 12.5h12V14H4v-1.5z" />
          </svg>
        </button>
      </div>
      {open ? (
        <div className="absolute inset-x-3 top-full z-[2001] mt-2 rounded-card border border-civic-line bg-civic-surface p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-civic-muted">
            This device · Kilimani
          </p>
          <p className="mt-1 text-sm text-civic-slate">
            UrbanMesh does not create reporter accounts. Reports on this phone stay on this phone.
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-civic-muted">
            How verification works
          </p>
          <ol className="mt-3 space-y-2 text-sm text-civic-slate">
            <li>1. A resident reports a hazard on Kilimani streets.</li>
            <li>2. Nearby reports of the same type become evidence — not likes.</li>
            <li>3. Three reports within 15 m verify a spatial cluster.</li>
            <li>4. Only verified clusters feed the walkability heatmap.</li>
            <li>5. Nairobi County uses them as LPDP planning evidence.</li>
          </ol>
          <div className="mt-3 flex gap-3">
            <Link to="/me" className="text-sm font-semibold text-civic-accent" onClick={() => setOpen(false)}>
              My reports
            </Link>
            <button
              type="button"
              className="text-sm font-semibold text-civic-muted"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function BottomNav() {
  const item =
    "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-semibold";
  return (
    <nav className="relative z-[2000] shrink-0 border-t border-civic-line bg-civic-surface pb-[env(safe-area-inset-bottom)]">
      <div className="flex min-h-14">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${item} ${isActive ? "text-civic-accent" : "text-civic-muted"}`
          }
        >
          <MapIcon />
          Map
        </NavLink>
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `${item} ${isActive ? "text-civic-accent" : "text-civic-muted"}`
          }
        >
          <ListIcon />
          Reports
        </NavLink>
        <NavLink
          to="/me"
          className={({ isActive }) =>
            `${item} ${isActive ? "text-civic-accent" : "text-civic-muted"}`
          }
        >
          <UserIcon />
          My Reports
        </NavLink>
      </div>
    </nav>
  );
}

function MapIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 4.5 3.5 6.5v13l5.5-2 6 2 5.5-2v-13L15.5 6.5 9 4.5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M9 4.5v13M15.5 6.5v13" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 7h14M5 12h14M5 17h10"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
