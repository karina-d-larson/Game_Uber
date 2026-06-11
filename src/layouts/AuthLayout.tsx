import { Link, Outlet } from 'react-router-dom'
import { MaterialIcon } from '../components/MaterialIcon'
import { ROUTES } from '../routes/paths'

/** Centered mobile-first shell for login and signup. */
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-on-background">
      <header className="px-gutter-mobile pt-safe md:px-gutter-desktop">
        <Link
          to={ROUTES.login}
          className="inline-flex min-h-11 items-center gap-sm font-headline-md text-headline-md text-primary"
        >
          <MaterialIcon name="grid_view" className="text-secondary" aria-hidden="true" />
          BoardLink
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-gutter-mobile py-xl pb-safe md:px-gutter-desktop">
        {/* max-w-(--container-md): spacing tokens redefine max-w-md/xl as 16px/32px — see tailwind.config.ts */}
        <div className="mx-auto w-full max-w-(--container-md)">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
