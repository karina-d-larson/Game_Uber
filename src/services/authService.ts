/**
 * AUTH DATA LAYER — Firebase Auth + Firestore user profiles
 * ===========================================================
 *
 * Session sources (single listener):
 * - subscribeToAuthChanges() → UI (AuthContext) + cachedUser for services
 * - getCurrentUser()         → sync read of cachedUser / auth.currentUser fallback
 *
 * Do NOT import Firebase in UI/components.
 */

import type { AuthUser, LoginInput, SignupInput } from '../types/user'

import { COLLECTIONS } from '../config/firebaseCollections'
import { auth, db, isFirebaseConfigured } from '../lib/firebase'

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
  type User,
} from 'firebase/auth'

import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore'

/* =========================================================
   ERROR CLASS
========================================================= */

export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthServiceError'
  }
}

/* =========================================================
   DEFAULTS
========================================================= */

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDKHIZ20m5AdsPygH7mo9GAuD80aTL1xPNpdImx_PbFWb2frljMf0-fa9nge7yqMfhFyaoBDh6ebxk3Gw4W7FyskHsCV8GEnP61EJoS7kCkTtOeZ5DoilGGfNxKrkO4uQYnWY68kDyGSEOszS1csnfhTtXjjNVAxzPydRi1ChhsLJL0i2_KYXFjiuG3wqA0yiAkjW2HFNlQk3HJ6pv_AobcvOdPxIVOlOEGe78QMDjrvw8r3MQ9XRbkv05WoJl0boYQlLJFe_Z-7g'

/* =========================================================
   VALIDATION
========================================================= */

function validateLoginInput({ email, password }: LoginInput): void {
  if (!email.trim()) throw new AuthServiceError('Email is required.')
  if (!password) throw new AuthServiceError('Password is required.')
}

function validateSignupInput({
  email,
  password,
  username,
}: SignupInput): void {
  validateLoginInput({ email, password })

  if (!username.trim()) {
    throw new AuthServiceError('Username is required.')
  }

  if (username.trim().length < 3) {
    throw new AuthServiceError('Username must be at least 3 characters.')
  }
}

function requireFirebaseAuth(): Auth {
  if (!isFirebaseConfigured || !auth) {
    throw new AuthServiceError(
      'Firebase is not configured. Copy .env.example to .env and add your Firebase keys.',
    )
  }
  return auth
}

function requireFirestoreDb() {
  if (!isFirebaseConfigured || !db) {
    throw new AuthServiceError(
      'Firebase is not configured. Copy .env.example to .env and add your Firebase keys.',
    )
  }
  return db
}

function mapAuthError(err: unknown, fallback: string): AuthServiceError {
  const code = typeof err === 'object' && err && 'code' in err ? String(err.code) : ''
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return new AuthServiceError('Sign-in was cancelled.')
  }
  if (code === 'auth/popup-blocked') {
    return new AuthServiceError(
      'Pop-up was blocked. Allow pop-ups for this site and try again.',
    )
  }
  if (err instanceof Error && err.message) {
    return new AuthServiceError(err.message)
  }
  return new AuthServiceError(fallback)
}

function deriveUsernameFromEmail(email: string, uid: string): string {
  const prefix = email.split('@')[0]?.trim().toLowerCase() || 'user'
  let sanitized = prefix
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')

  if (sanitized.length < 3) {
    sanitized = `${sanitized || 'user'}_${uid.slice(0, 4)}`.replace(/[^a-z0-9_]/g, '')
  }

  return sanitized.slice(0, 30) || `user_${uid.slice(0, 6)}`
}

async function ensureGoogleUserProfile(firebaseUser: User): Promise<AuthUser> {
  const firestore = requireFirestoreDb()
  const ref = doc(firestore, COLLECTIONS.users, firebaseUser.uid)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    return authUserFromProfile(firebaseUser, snap.data() as Record<string, unknown>)
  }

  const email = firebaseUser.email ?? ''
  const username = deriveUsernameFromEmail(email, firebaseUser.uid)
  const displayName = firebaseUser.displayName?.trim() || username
  const avatar = firebaseUser.photoURL?.trim() || DEFAULT_AVATAR
  const now = Date.now()

  const newProfile = {
    id: firebaseUser.uid,
    email,
    username,
    displayName,
    avatar,
    createdAt: now,
    updatedAt: now,
  }

  await setDoc(ref, newProfile, { merge: true })

  return authUserFromProfile(firebaseUser, newProfile)
}

function userFromFirebaseAuth(firebaseUser: {
  uid: string
  email: string | null
}): AuthUser {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    username: firebaseUser.email?.split('@')[0] ?? 'user',
    displayName: firebaseUser.email?.split('@')[0] ?? 'User',
    avatar: DEFAULT_AVATAR,
  }
}

function authUserFromProfile(
  firebaseUser: { uid: string; email: string | null },
  profile: Record<string, unknown> | null,
): AuthUser {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    username:
      (typeof profile?.username === 'string' && profile.username) ||
      firebaseUser.email?.split('@')[0] ||
      'user',
    displayName:
      (typeof profile?.displayName === 'string' && profile.displayName) ||
      firebaseUser.email?.split('@')[0] ||
      'User',
    avatar:
      (typeof profile?.avatar === 'string' && profile.avatar) || DEFAULT_AVATAR,
    bio: typeof profile?.bio === 'string' && profile.bio ? profile.bio : undefined,
  }
}

/* =========================================================
   LOGIN (FIREBASE)
========================================================= */

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {

  validateLoginInput({ email, password })

  try {
    const userCredential = await signInWithEmailAndPassword(
      requireFirebaseAuth(),
      email,
      password,
    )

    return userFromFirebaseAuth(userCredential.user)

  } catch (err: unknown) {
    throw mapAuthError(err, 'Sign-in failed. Please try again.')
  }
}

/* =========================================================
   GOOGLE LOGIN (FIREBASE + FIRESTORE)
========================================================= */

export async function loginWithGoogle(): Promise<AuthUser> {
  try {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })

    const userCredential = await signInWithPopup(requireFirebaseAuth(), provider)
    const authUser = await ensureGoogleUserProfile(userCredential.user)
    cachedUser = authUser
    return authUser
  } catch (err: unknown) {
    throw mapAuthError(err, 'Google sign-in failed. Please try again.')
  }
}

/* =========================================================
   SIGNUP (FIREBASE + FIRESTORE)
========================================================= */

export async function signup(
  email: string,
  password: string,
  username: string,
): Promise<AuthUser> {

  validateSignupInput({ email, password, username })

  try {
    const userCredential =
      await createUserWithEmailAndPassword(
        requireFirebaseAuth(),
        email,
        password,
      )

    const user = userCredential.user

    const newUser: AuthUser = {
      id: user.uid,
      email: user.email ?? '',
      username,
      displayName: username,
      avatar: DEFAULT_AVATAR,
    }

    await setDoc(doc(db, COLLECTIONS.users, user.uid), newUser)

    return newUser

  } catch (err: unknown) {
    throw mapAuthError(err, 'Could not create account. Please try again.')
  }
}

/* =========================================================
   LOGOUT (FIREBASE)
========================================================= */

export async function logout(): Promise<void> {
  if (!isFirebaseConfigured || !auth) return
  try {
    await signOut(auth)
  } catch (err: unknown) {
    throw mapAuthError(err, 'Sign-out failed. Please try again.')
  }
}

/* =========================================================
   AUTH STATE — single listener for UI + service cache
========================================================= */

let cachedUser: AuthUser | null = null

/** Sync session user for services (e.g. listingService). Populated by subscribeToAuthChanges. */
export function getCurrentUser(): AuthUser | null {
  if (cachedUser) return cachedUser

  if (!isFirebaseConfigured || !auth) return null

  const firebaseUser = auth.currentUser
  if (!firebaseUser) return null

  return userFromFirebaseAuth(firebaseUser)
}

export function subscribeToAuthChanges(
  callback: (user: AuthUser | null) => void,
) {
  if (!isFirebaseConfigured || !auth) {
    cachedUser = null
    callback(null)
    return () => {}
  }

  return onAuthStateChanged(auth, (firebaseUser) => {
    if (!firebaseUser) {
      cachedUser = null
      callback(null)
      return
    }

    // Resolve UI immediately — enrich profile from Firestore in background.
    cachedUser = userFromFirebaseAuth(firebaseUser)
    callback(cachedUser)

    void (async () => {
      try {
        const ref = doc(db, COLLECTIONS.users, firebaseUser.uid)
        const snap = await getDoc(ref)
        const profile = snap.exists()
          ? (snap.data() as Record<string, unknown>)
          : null

        cachedUser = authUserFromProfile(firebaseUser, profile)

        callback(cachedUser)
      } catch (err) {
        console.error('Auth profile sync error:', err)
      }
    })()
  })
}

/** Re-fetch Firestore profile for the signed-in user and refresh cachedUser. */
export async function refreshSessionProfile(): Promise<AuthUser | null> {
  if (!isFirebaseConfigured || !auth) return null

  const firebaseUser = auth.currentUser
  if (!firebaseUser) {
    cachedUser = null
    return null
  }

  try {
    const ref = doc(db, COLLECTIONS.users, firebaseUser.uid)
    const snap = await getDoc(ref)
    const profile = snap.exists() ? (snap.data() as Record<string, unknown>) : null
    cachedUser = authUserFromProfile(firebaseUser, profile)
    return cachedUser
  } catch (err) {
    console.error('Auth profile refresh error:', err)
    return cachedUser
  }
}