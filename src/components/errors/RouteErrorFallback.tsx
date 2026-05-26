import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom'
import { MaterialIcon } from '../MaterialIcon'
import { ROUTES } from '../../routes/paths'

/**
 * Generic route error UI — used by React Router errorElement.
 *
 * FIREBASE TODO: map known service errors to user-friendly copy.
 */
export function RouteErrorFallback() {
  const error = useRouteError()

  let title = 'Something went wrong'
  let description = 'We could not load this page. Please try again.'

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`
    description = error.data?.message ?? description
  } else if (error instanceof Error) {
    description = error.message
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-lg bg-background px-gutter-mobile py-xl text-on-background">
      <MaterialIcon name="error_outline" className="text-5xl text-error" />
      <div className="max-w-md space-y-sm text-center">
        <h1 className="font-headline-lg text-headline-lg text-primary">{title}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">{description}</p>
      </div>
      <div className="flex flex-col gap-sm sm:flex-row">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="min-h-11 rounded-lg bg-secondary px-lg py-3 font-label-md text-label-md text-on-secondary"
        >
          Reload
        </button>
        <Link
          to={ROUTES.home}
          className="flex min-h-11 items-center justify-center rounded-lg border border-outline-variant px-lg py-3 font-label-md text-label-md text-on-surface"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
