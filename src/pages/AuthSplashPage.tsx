import { MaterialIcon } from '../components/MaterialIcon'

/** Shown while AuthContext restores session from authService.getCurrentUser(). */
export function AuthSplashPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-lg bg-background px-gutter-mobile text-on-background">
      <div className="flex items-center gap-sm">
        <MaterialIcon name="grid_view" className="text-4xl text-secondary" />
        <span className="font-display-lg text-display-lg text-primary">BoardLink</span>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant">
        Loading your session…
      </p>
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-outline-variant border-t-secondary"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
