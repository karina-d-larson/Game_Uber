/**
 * App auth user — maps to Firebase Auth + Firestore users/{uid} when connected.
 * See docs/FIREBASE_INTEGRATION.md — Authentication
 */

export type AuthUser = {
  /** Firebase Auth uid (mock: generated UUID) */
  id: string
  email: string
  /** Handle without @, e.g. boardgame_guru */
  username: string
  displayName: string
  avatar: string
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
