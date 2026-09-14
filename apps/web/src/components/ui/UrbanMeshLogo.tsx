interface UrbanMeshLogoProps {
  className?: string;
  /** Show wordmark beside the mark */
  withWordmark?: boolean;
  /** Elegant tagline under the wordmark */
  withTagline?: boolean;
  tagline?: string;
  title?: string;
}

/**
 * UrbanMesh brand mark — H3-inspired hex mesh with a walkability path cut through.
 */
export function UrbanMeshLogo({
  className = "",
  withWordmark = true,
  withTagline = true,
  tagline = "Walkability, made visible.",
  title = "UrbanMesh",
}: UrbanMeshLogoProps) {
  return (
    <div
      className={`inline-flex items-center gap-3 ${className}`}
      role="img"
      aria-label={withTagline ? `${title} — ${tagline}` : title}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 self-start sm:mt-0.5"
        aria-hidden
      >
        {/* Soft plate */}
        <rect width="64" height="64" rx="14" fill="#E8F1F4" />

        {/* Outer hex */}
        <path
          d="M32 8 L52 19.5 V42.5 L32 54 L12 42.5 V19.5 Z"
          stroke="#0B1F2A"
          strokeWidth="2.25"
          strokeLinejoin="round"
          fill="#F7FBFC"
        />

        {/* Mesh lattice inside hex */}
        <path
          d="M22 25.5 L32 20 L42 25.5 V36.5 L32 42 L22 36.5 Z"
          stroke="#0E7C6B"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
          opacity="0.85"
        />
        <path
          d="M32 20 V42 M22 25.5 L42 36.5 M42 25.5 L22 36.5"
          stroke="#0E7C6B"
          strokeWidth="1.25"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* Street rays */}
        <path
          d="M32 8 V20 M52 19.5 L42 25.5 M52 42.5 L42 36.5 M32 54 V42 M12 42.5 L22 36.5 M12 19.5 L22 25.5"
          stroke="#1C3A4A"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.35"
        />

        {/* Walkability route — bold teal path with nodes */}
        <path
          d="M16.5 40.5 C22 34 28 28.5 32 27 C36.5 25.2 43 22 48.5 17.5"
          stroke="#0E7C6B"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="16.5" cy="40.5" r="3.1" fill="#0B1F2A" />
        <circle
          cx="32"
          cy="27"
          r="2.6"
          fill="#0E7C6B"
          stroke="#F7FBFC"
          strokeWidth="1.2"
        />
        <circle cx="48.5" cy="17.5" r="3.1" fill="#0B1F2A" />
      </svg>

      {withWordmark ? (
        <div className="flex min-w-0 flex-col">
          <span className="font-display text-3xl font-bold tracking-tight text-civic-ink sm:text-4xl">
            UrbanMesh
          </span>
          {withTagline ? (
            <p className="mt-0.5 font-display text-[0.95rem] font-medium italic leading-snug tracking-[0.01em] text-civic-slate sm:text-lg">
              {tagline}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
