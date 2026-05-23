import { Link, Outlet } from 'react-router-dom'
import { MaterialIcon } from '../components/MaterialIcon'

/** Centered mobile-first shell for login and signup. */
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-on-background">
      <header className="px-gutter-mobile pt-xl md:px-gutter-desktop">
        <Link
          to="/login"
          className="inline-flex items-center gap-sm font-headline-md text-headline-md text-primary"
        >
          <MaterialIcon name="grid_view" className="text-secondary" />
          BoardLink
        </Link>
      </header>

      <main className="flex flex-1 flex-col justify-center px-gutter-mobile py-xl md:px-gutter-desktop">
        <div className="mx-auto w-64">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
