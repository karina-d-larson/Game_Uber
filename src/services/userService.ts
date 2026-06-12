/**
 * User profile data layer — Firestore users/{uid} reads and updates.
 * UI must call this service, not Firebase directly.
 */

import { doc, getDoc, updateDoc } from 'firebase/firestore'

import { COLLECTIONS } from '../config/firebaseCollections'
import { db, isFirebaseConfigured } from '../lib/firebase'
import type { ProfileUpdateInput, UserProfile } from '../types/user'

import { getCurrentUser } from './authService'

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDKHIZ20m5AdsPygH7mo9GAuD80aTL1xPNpdImx_PbFWb2frljMf0-fa9nge7yqMfhFyaoBDh6ebxk3Gw4W7FyskHsCV8GEnP61EJoS7kCkTtOeZ5DoilGGfNxKrkO4uQYnWY68kDyGSEOszS1csnfhTtXjjNVAxzPydRi1ChhsLJL0i2_KYXFjiuG3wqA0yiAkjW2HFNlQk3HJ6pv_AobcvOdPxIVOlOEGe78QMDjrvw8r3MQ9XRbkv05WoJl0boYQlLJFe_Z-7g'

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

function mapDocToUserProfile(
  uid: string,
  email: string,
  data: Record<string, unknown>,
): UserProfile {
  return {
    id: uid,
    email: typeof data.email === 'string' ? data.email : email,
    username: typeof data.username === 'string' ? data.username : 'user',
    displayName: typeof data.displayName === 'string' ? data.displayName : 'User',
    avatar: typeof data.avatar === 'string' ? data.avatar : DEFAULT_AVATAR,
    bio: typeof data.bio === 'string' ? data.bio : undefined,
    rating: typeof data.rating === 'number' ? data.rating : undefined,
    reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : undefined,
    lenderScore: typeof data.lenderScore === 'number' ? data.lenderScore : undefined,
    renterScore: typeof data.renterScore === 'number' ? data.renterScore : undefined,
    completedTrades:
      typeof data.completedTrades === 'number' ? data.completedTrades : undefined,
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : undefined,
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

  const ref = doc(requireFirestore(), COLLECTIONS.users, uid)
  const updateData: Record<string, string> = {
    displayName: patch.displayName.trim(),
    username: patch.username.trim(),
    avatar: patch.avatar?.trim() || DEFAULT_AVATAR,
    bio: patch.bio?.trim() ?? '',
  }

  try {
    await updateDoc(ref, updateData)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update profile.'
    throw new UserServiceError(message)
  }

  const updated = await getProfile(uid)
  if (!updated) {
    throw new UserServiceError('Profile not found after update.')
  }

  return updated
}
