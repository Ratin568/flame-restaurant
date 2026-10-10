export default function LocaleLoading() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12" aria-busy="true" aria-live="polite" aria-label="Loading page">
      <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-muted" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({length: 6}, (_, index) => <div key={index} className="h-44 animate-pulse rounded-xl border border-border bg-muted/40" />)}
      </div>
      <span className="sr-only">Loading content…</span>
    </section>
  );
}
