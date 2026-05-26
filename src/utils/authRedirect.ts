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
