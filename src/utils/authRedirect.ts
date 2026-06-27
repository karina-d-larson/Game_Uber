import { ROUTES } from '../routes/paths'
import type { AuthRedirectState } from '../routes/guards'

/** Safe post-login path from router location state. */
export function getPostAuthPath(state: unknown): string {
  const from = (state as AuthRedirectState | null)?.from
  if (!from) return ROUTES.home
  if (from.startsWith(ROUTES.login) || from.startsWith(ROUTES.signup)) {
    return ROUTES.home
  }
  return from
}

/** Build return path from current location (pathname + search + hash). */
export function getReturnPathFromLocation(location: {
  pathname: string
  search?: string
  hash?: string
}): string {
  return `${location.pathname}${location.search ?? ''}${location.hash ?? ''}`
}

/** Login navigation target preserving intended return URL after sign-in. */
export function buildLoginRedirect(from: string): {
  pathname: string
  state: AuthRedirectState
} {
  return {
    pathname: ROUTES.login,
    state: { from },
  }
}
