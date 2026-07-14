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
import { normalizeAvatarFromDoc } from '../utils/avatarDisplay'

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
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
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return new AuthServiceError('Current password is incorrect.')
  }
  if (code === 'auth/weak-password') {
    return new AuthServiceError('New password must be at least 6 characters.')
  }
  if (code === 'auth/requires-recent-login') {
    return new AuthServiceError('Please sign out and sign in again, then retry.')
  }
  if (code === 'auth/user-not-found' || code === 'auth/invalid-email') {
    return new AuthServiceError('No account found for that email.')
  }
  if (code.startsWith('auth/')) {
    return new AuthServiceError(fallback)
  }
  if (err instanceof Error && err.message) {
    return new AuthServiceError(err.message)
  }
  return new AuthServiceError(fallback)
}

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

/* =========================================================
   VALIDATION
========================================================= */

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
  const avatar = firebaseUser.photoURL?.trim() || ''
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
    avatar: '',
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
    avatar: normalizeAvatarFromDoc(profile?.avatar),
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
      avatar: '',
    }

    const firestore = requireFirestoreDb()
    await setDoc(doc(firestore, COLLECTIONS.users, user.uid), newUser)

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
   PASSWORD / ACCOUNT RECOVERY (email/password only)
========================================================= */

/** True when the signed-in user has email/password as a sign-in provider. */
export function isEmailPasswordUser(): boolean {
  if (!isFirebaseConfigured || !auth?.currentUser) return false
  return auth.currentUser.providerData.some(
    (provider) => provider.providerId === 'password',
  )
}

export async function sendPasswordReset(email: string): Promise<void> {
  const trimmed = email.trim()
  if (!trimmed) {
    throw new AuthServiceError('Email is required.')
  }

  try {
    await sendPasswordResetEmail(requireFirebaseAuth(), trimmed)
  } catch (err: unknown) {
    throw mapAuthError(err, 'Could not send reset email. Please try again.')
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  if (!currentPassword) {
    throw new AuthServiceError('Current password is required.')
  }
  if (!newPassword) {
    throw new AuthServiceError('New password is required.')
  }
  if (newPassword.length < 6) {
    throw new AuthServiceError('New password must be at least 6 characters.')
  }

  const firebaseAuth = requireFirebaseAuth()
  const firebaseUser = firebaseAuth.currentUser
  if (!firebaseUser?.email) {
    throw new AuthServiceError('You must be signed in to change your password.')
  }
  if (!isEmailPasswordUser()) {
    throw new AuthServiceError('Password is managed by Google.')
  }

  try {
    const credential = EmailAuthProvider.credential(
      firebaseUser.email,
      currentPassword,
    )
    await reauthenticateWithCredential(firebaseUser, credential)
    await updatePassword(firebaseUser, newPassword)
  } catch (err: unknown) {
    throw mapAuthError(err, 'Could not change password. Please try again.')
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