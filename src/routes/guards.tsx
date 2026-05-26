import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthSplashPage } from '../pages/AuthSplashPage'
import { ROUTES } from './paths'

export type AuthRedirectState = {
  from?: string
}

/**
 * Waits for initial auth restore before rendering child routes.
 *
 * FIREBASE TODO: splash duration follows onAuthStateChanged; no route changes needed.
 */
export function AuthGate() {
  const { loading } = useAuth()

  if (loading) {
    return <AuthSplashPage />
  }

  return <Outlet />
}

/** Sends authenticated users to the feed; guests stay on auth pages. */
export function GuestRoute() {
  const { user } = useAuth()
  const location = useLocation()
  const state = location.state as AuthRedirectState | null
  const redirectTo = state?.from && state.from !== ROUTES.login ? state.from : ROUTES.home

  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

/**
 * Requires signed-in user. Redirects to login with return path.
 *
 * FIREBASE TODO: same guard after Firebase Auth — only authService source changes.
 */
export function ProtectedRoute() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    const from = `${location.pathname}${location.search}${location.hash}`
    return (
      <Navigate
        to={ROUTES.login}
        replace
        state={{ from } satisfies AuthRedirectState}
      />
    )
  }

  return <Outlet />
}
