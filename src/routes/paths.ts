/**
 * Central route paths — use these instead of hardcoded strings in navigation.
 *
 * FIREBASE TODO: messaging routes may gain query params (e.g. ?listingId=) later.
 */

export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  inbox: '/inbox',
  profile: '/profile',
  editProfile: '/profile/edit',
  following: '/profile/following',
  settings: '/settings',
  createListing: '/listings/new',
  listing: (id: string) => `/listings/${id}`,
  editListing: (id: string) => `/listings/${id}/edit`,
  chat: (conversationId: string) => `/inbox/${conversationId}`,
} as const

/** Paths that use the tab shell (bottom navigation visible). */
export const TAB_ROUTES = [
  ROUTES.home,
  ROUTES.inbox,
  ROUTES.createListing,
  ROUTES.profile,
] as const

export function isTabRoute(pathname: string): boolean {
  if (pathname === ROUTES.home) return true
  if (pathname === ROUTES.inbox) return true
  if (pathname === ROUTES.createListing) return true
  if (pathname === ROUTES.profile) return true
  return false
}
