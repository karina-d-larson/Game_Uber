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
  type Auth,
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

  } catch (err: any) {
    throw new AuthServiceError(err.message)
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

  } catch (err: any) {
    throw new AuthServiceError(err.message)
  }
}

/* =========================================================
   LOGOUT (FIREBASE)
========================================================= */

export async function logout(): Promise<void> {
  if (!isFirebaseConfigured || !auth) return
  try {
    await signOut(auth)
  } catch (err: any) {
    throw new AuthServiceError(err.message)
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
        const profile = snap.exists() ? snap.data() : null

        cachedUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          username:
            profile?.username ??
            firebaseUser.email?.split('@')[0] ??
            'user',
          displayName:
            profile?.displayName ??
            firebaseUser.email?.split('@')[0] ??
            'User',
          avatar: profile?.avatar ?? DEFAULT_AVATAR,
        }

        callback(cachedUser)
      } catch (err) {
        console.error('Auth profile sync error:', err)
      }
    })()
  })
}