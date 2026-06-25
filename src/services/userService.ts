/**
 * User profile data layer — Firestore users/{uid} reads and updates.
 * UI must call this service, not Firebase directly.
 */

import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

import { COLLECTIONS } from '../config/firebaseCollections'
import { db, isFirebaseConfigured } from '../lib/firebase'
import type {
  PreferencesUpdateInput,
  PreferredListingType,
  ProfileUpdateInput,
  UserPreferences,
  UserProfile,
} from '../types/user'
import { DEFAULT_USER_PREFERENCES } from '../types/user'
import { normalizeAvatarFromDoc } from '../utils/avatarDisplay'

import { getCurrentUser } from './authService'

export class UserServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserServiceError'
  }
}

function requireFirestore() {
  if (!isFirebaseConfigured || !db) {
    throw new UserServiceError(
      'Firebase is not configured. Copy .env.example to .env and add your Firebase keys.',
    )
  }
  return db
}

function mapPreferencesFromDoc(data: Record<string, unknown>): UserPreferences {
  const rawTypes = data.preferredListingTypes
  const preferredListingTypes = Array.isArray(rawTypes)
    ? rawTypes.filter(
        (value): value is PreferredListingType =>
          value === 'lending' || value === 'wanted',
      )
    : DEFAULT_USER_PREFERENCES.preferredListingTypes

  const rawCategories = data.preferredCategories
  const preferredCategories = Array.isArray(rawCategories)
    ? rawCategories.filter((value): value is string => typeof value === 'string')
    : DEFAULT_USER_PREFERENCES.preferredCategories

  return {
    preferredListingTypes:
      preferredListingTypes.length > 0
        ? preferredListingTypes
        : DEFAULT_USER_PREFERENCES.preferredListingTypes,
    preferredCategories,
    showProfilePhoto:
      typeof data.showProfilePhoto === 'boolean'
        ? data.showProfilePhoto
        : DEFAULT_USER_PREFERENCES.showProfilePhoto,
    showFollowingList:
      typeof data.showFollowingList === 'boolean'
        ? data.showFollowingList
        : DEFAULT_USER_PREFERENCES.showFollowingList,
  }
}

function mapDocToUserProfile(
  uid: string,
  email: string,
  data: Record<string, unknown>,
): UserProfile {
  const following = Array.isArray(data.following)
    ? data.following.filter((id): id is string => typeof id === 'string')
    : []

  return {
    id: uid,
    email: typeof data.email === 'string' ? data.email : email,
    username: typeof data.username === 'string' ? data.username : 'user',
    displayName: typeof data.displayName === 'string' ? data.displayName : 'User',
    avatar: normalizeAvatarFromDoc(data.avatar),
    bio: typeof data.bio === 'string' ? data.bio : undefined,
    following,
    rating: typeof data.rating === 'number' ? data.rating : undefined,
    reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : undefined,
    lenderScore: typeof data.lenderScore === 'number' ? data.lenderScore : undefined,
    renterScore: typeof data.renterScore === 'number' ? data.renterScore : undefined,
    completedTrades:
      typeof data.completedTrades === 'number' ? data.completedTrades : undefined,
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : undefined,
    preferences: mapPreferencesFromDoc(data),
  }
}

function validateProfileUpdate(patch: ProfileUpdateInput): void {
  if (!patch.displayName.trim()) {
    throw new UserServiceError('Display name is required.')
  }

  if (!patch.username.trim()) {
    throw new UserServiceError('Username is required.')
  }

  if (patch.username.trim().length < 3) {
    throw new UserServiceError('Username must be at least 3 characters.')
  }
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(requireFirestore(), COLLECTIONS.users, uid))
  if (!snap.exists()) return null

  const data = snap.data() as Record<string, unknown>
  const email = typeof data.email === 'string' ? data.email : ''
  return mapDocToUserProfile(uid, email, data)
}

export async function updateProfile(
  uid: string,
  patch: ProfileUpdateInput,
): Promise<UserProfile> {
  const current = getCurrentUser()
  if (!current || current.id !== uid) {
    throw new UserServiceError('You can only update your own profile.')
  }

  validateProfileUpdate(patch)

  const updateData: Record<string, string> = {
    id: uid,
    email: current.email,
    displayName: patch.displayName.trim(),
    username: patch.username.trim(),
    avatar: patch.avatar?.trim() ?? '',
    bio: patch.bio?.trim() ?? '',
  }

  await writeUserFields(uid, updateData)

  const updated = await getProfile(uid)
  if (!updated) {
    throw new UserServiceError('Profile not found after update.')
  }

  return updated
}

function assertOwnProfile(uid: string): void {
  const current = getCurrentUser()
  if (!current || current.id !== uid) {
    throw new UserServiceError('You can only update your own profile.')
  }
}

async function writeUserFields(
  uid: string,
  fields: Record<string, unknown>,
): Promise<void> {
  const ref = doc(requireFirestore(), COLLECTIONS.users, uid)
  try {
    await setDoc(ref, fields, { merge: true })
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code: string }).code)
        : ''
    if (code === 'permission-denied') {
      throw new UserServiceError(
        'Firestore blocked this save. Check Firebase security rules for users/{uid}.',
      )
    }
    const message = err instanceof Error ? err.message : 'Failed to save.'
    throw new UserServiceError(message)
  }
}

export async function getPreferences(uid: string): Promise<UserPreferences> {
  const profile = await getProfile(uid)
  return profile?.preferences ?? { ...DEFAULT_USER_PREFERENCES }
}

export async function updatePreferences(
  uid: string,
  patch: PreferencesUpdateInput,
): Promise<UserPreferences> {
  assertOwnProfile(uid)

  const current = await getPreferences(uid)
  const next: UserPreferences = {
    preferredListingTypes:
      patch.preferredListingTypes ?? current.preferredListingTypes,
    preferredCategories:
      patch.preferredCategories ?? current.preferredCategories,
    showProfilePhoto: patch.showProfilePhoto ?? current.showProfilePhoto,
    showFollowingList: patch.showFollowingList ?? current.showFollowingList,
  }

  if (next.preferredListingTypes.length === 0) {
    throw new UserServiceError('Select at least one listing type.')
  }

  const currentUser = getCurrentUser()!
  await writeUserFields(uid, {
    id: uid,
    email: currentUser.email,
    ...next,
  })

  return next
}

export async function getFollowingIds(uid: string): Promise<string[]> {
  const profile = await getProfile(uid)
  return profile?.following ?? []
}

export async function isFollowing(targetUserId: string): Promise<boolean> {
  const current = getCurrentUser()
  if (!current) return false
  const following = await getFollowingIds(current.id)
  return following.includes(targetUserId)
}

export async function followUser(targetUserId: string): Promise<void> {
  const current = getCurrentUser()
  if (!current) {
    throw new UserServiceError('You must be signed in to follow someone.')
  }
  if (current.id === targetUserId) {
    throw new UserServiceError('You cannot follow yourself.')
  }

  const target = await getProfile(targetUserId)
  if (!target) {
    throw new UserServiceError('User not found.')
  }

  await writeUserFields(current.id, {
    id: current.id,
    email: current.email,
    following: arrayUnion(targetUserId),
  })
}

export async function unfollowUser(targetUserId: string): Promise<void> {
  const current = getCurrentUser()
  if (!current) {
    throw new UserServiceError('You must be signed in to unfollow someone.')
  }

  await writeUserFields(current.id, {
    id: current.id,
    email: current.email,
    following: arrayRemove(targetUserId),
  })
}
