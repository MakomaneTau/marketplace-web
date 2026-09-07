export default function Loading() {
  return (
    <main aria-busy="true" aria-live="polite" className="grid min-h-[45vh] place-items-center px-4 py-12">
      <div role="status" className="text-center">
        <span className="mx-auto block size-10 animate-spin rounded-full border-4 border-primary-soft border-t-primary" />
        <p className="mt-4 text-sm font-medium text-muted">Loading marketplace…</p>
      </div>
    </main>
  );
}
