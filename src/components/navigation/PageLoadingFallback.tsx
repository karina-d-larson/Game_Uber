import { MaterialIcon } from '../MaterialIcon'

/** Route-level loading placeholder (Suspense / future lazy routes). */
export function PageLoadingFallback() {
  return (
    <div
      className="flex min-h-[50dvh] flex-col items-center justify-center gap-md px-gutter-mobile py-xl"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <MaterialIcon name="grid_view" className="text-4xl text-secondary" />
      <p className="font-body-md text-body-md text-on-surface-variant">Loading…</p>
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-secondary"
        aria-hidden="true"
      />
    </div>
  )
}
