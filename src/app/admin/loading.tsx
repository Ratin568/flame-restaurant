export default function AdminLoading() {
  return <section className="p-6 lg:p-8" aria-busy="true" aria-live="polite" aria-label="Loading admin page"><div className="h-8 w-56 animate-pulse rounded bg-muted" /><div className="mt-6 h-56 animate-pulse rounded-xl border border-border bg-muted/40" /><span className="sr-only">Loading admin content…</span></section>;
}
