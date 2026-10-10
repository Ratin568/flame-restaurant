'use client';

export default function AdminError({reset}: {error: Error & {digest?: string}; reset: () => void}) {
  return <section className="flex min-h-[45svh] flex-col items-start justify-center gap-4 p-6" role="alert"><h1 className="text-2xl font-bold">Admin page unavailable</h1><p className="text-sm text-muted-foreground">The operation did not finish. Retry, and verify the audit log before repeating any action that could change an order or payment.</p><button type="button" onClick={() => reset()} className="min-h-11 rounded-full border border-border px-5 py-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Try again</button></section>;
}
