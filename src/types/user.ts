/**
 * App auth user — maps to Firebase Auth + Firestore users/{uid} when connected.
 * See docs/FIREBASE_REFERENCE.md — users schema
 *
 * AuthUser: minimal session shape used by AuthContext and route guards.
 * UserProfile: extended Firestore profile (ProfilePage, public profile views).
 */

export type PreferredListingType = 'lending' | 'wanted' // UI: Offers | Requests

/** Stored on users/{uid} alongside profile fields. */
export type UserPreferences = {
  preferredListingTypes: PreferredListingType[]
  preferredCategories: string[]
  showProfilePhoto: boolean
  showFollowingList: boolean
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  preferredListingTypes: ['lending', 'wanted'],
  preferredCategories: [],
  showProfilePhoto: true,
  showFollowingList: true,
}

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
 * Mapped in authService and userService.getProfile(uid).
 * Ratings/reviews are loaded from the reviews collection.
 */
export type UserProfile = AuthUser & {
  bio?: string
  /** UIDs of users this profile follows — stored on users/{uid}.following */
  following?: string[]
  rating?: number
  reviewCount?: number
  lenderScore?: number
  renterScore?: number
  completedTrades?: number
  createdAt?: number
  preferences?: UserPreferences
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

/** Partial preferences update — stored on users/{uid}. */
export type PreferencesUpdateInput = Partial<UserPreferences>
