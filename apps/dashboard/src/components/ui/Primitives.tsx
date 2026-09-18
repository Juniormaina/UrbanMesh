export function StatusBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="inline-flex items-center rounded-md bg-civic-verifiedBg px-2 py-0.5 text-[11px] font-semibold text-civic-verified">
      Community verified
    </span>
  ) : (
    <span className="inline-flex items-center rounded-md bg-civic-pendingBg px-2 py-0.5 text-[11px] font-semibold text-civic-pending">
      Pending
    </span>
  );
}

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-card border border-civic-line bg-civic-surface p-4 shadow-card">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-civic-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

export function Panel({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-civic-line bg-civic-surface p-4 shadow-card">
      <h2 className="text-sm font-semibold">{title}</h2>
      {hint ? <p className="mb-3 mt-1 text-xs text-civic-muted">{hint}</p> : null}
      {children}
    </section>
  );
}
