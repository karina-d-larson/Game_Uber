/**
 * App auth user — maps to Firebase Auth + Firestore users/{uid} when connected.
 * See docs/FIREBASE_INTEGRATION.md — Authentication
 *
 * AuthUser: minimal session shape used by AuthContext and route guards.
 * UserProfile: extended Firestore profile (ProfilePage, public profile views).
 */

export type AuthUser = {
  /** Firebase Auth uid (mock: generated UUID) */
  id: string
  email: string
  /** Handle without @, e.g. boardgame_guru */
  username: string
  displayName: string
  avatar: string
  bio?: string
}

/**
 * Extended profile stored in Firestore `users/{uid}`.
 * FIREBASE TODO: map in authService or userService.getProfile(uid).
 * ProfilePage mock STATS/REVIEWS should be replaced with these fields + reviews query.
 */
export type UserProfile = AuthUser & {
  bio?: string
  rating?: number
  reviewCount?: number
  lenderScore?: number
  renterScore?: number
  completedTrades?: number
  createdAt?: number
}

export type LoginInput = {
  email: string
  password: string
}

export type SignupInput = {
  email: string
  password: string
  username: string
}

/** Editable profile fields stored in Firestore users/{uid}. */
export type ProfileUpdateInput = {
  displayName: string
  username: string
  avatar?: string
  bio?: string
}
