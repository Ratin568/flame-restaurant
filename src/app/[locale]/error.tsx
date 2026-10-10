'use client';

export default function LocaleError({reset}: {error: Error & {digest?: string}; reset: () => void}) {
  return (
    <section className="mx-auto flex min-h-[45svh] max-w-xl flex-col items-start justify-center gap-4 px-4 py-12" role="alert">
      <p className="text-sm font-semibold uppercase tracking-widest text-destructive">Something went wrong</p>
      <h1 className="text-2xl font-bold">This page could not be loaded.</h1>
      <p className="text-sm text-muted-foreground">Your request was not completed. Please retry; if the problem continues, come back later.</p>
      <button type="button" onClick={() => reset()} className="min-h-11 rounded-full border border-border px-5 py-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Try again</button>
    </section>
  );
}
