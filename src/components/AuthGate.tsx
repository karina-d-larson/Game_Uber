import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthSplashPage } from '../pages/AuthSplashPage'

/**
 * Waits for initial auth restore before rendering child routes.
 *
 * FIREBASE TODO: splash duration follows onAuthStateChanged; no logic change needed in routes.
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

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

/**
 * Requires signed-in user. Redirects to /login with return path.
 *
 * FIREBASE TODO: same guard after Firebase Auth — only authService.getCurrentUser source changes.
 */
export function ProtectedRoute() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: 'protected' }} />
  }

  return <Outlet />
}
