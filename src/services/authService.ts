/**
 * AUTH DATA LAYER — Firebase implementation (clean architecture)
 * ==============================================================
 *
 * CURRENT STATE:
 * - login() → Firebase Auth (instant)
 * - signup() → Firebase Auth + Firestore profile
 * - logout() → Firebase Auth
 * - getCurrentUser() → replaced by subscribeToAuthChanges()
 *
 * IMPORTANT:
 * Do NOT import Firebase in UI/components.
 * All auth logic stays here.
 */

import type { AuthUser, LoginInput, SignupInput } from '../types/user'

import { auth, db } from '../lib/firebase'

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
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
      auth,
      email,
      password,
    )

    const user = userCredential.user

    return {
      id: user.uid,
      email: user.email ?? '',
      username: user.email?.split('@')[0] ?? 'user',
      displayName: user.email?.split('@')[0] ?? 'User',
      avatar: DEFAULT_AVATAR,
    }

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
        auth,
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

    // Store profile in Firestore
    await setDoc(doc(db, 'users', user.uid), newUser)

    return newUser

  } catch (err: any) {
    throw new AuthServiceError(err.message)
  }
}

/* =========================================================
   LOGOUT (FIREBASE)
========================================================= */

export async function logout(): Promise<void> {
  try {
    await signOut(auth)
  } catch (err: any) {
    throw new AuthServiceError(err.message)
  }
}

/* =========================================================
   AUTH STATE LISTENER (REPLACES getCurrentUser)
========================================================= */

let cachedUser: AuthUser | null = null

export function subscribeToAuthChanges(
  callback: (user: AuthUser | null) => void,
) {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      cachedUser = null
      callback(null)
      return
    }

    try {
      const ref = doc(db, 'users', firebaseUser.uid)
      const snap = await getDoc(ref)

      const profile = snap.exists()
        ? snap.data()
        : null

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
      console.error('Auth sync error:', err)

      cachedUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        username: 'user',
        displayName: 'User',
        avatar: DEFAULT_AVATAR,
      }

      callback(cachedUser)
    }
  })
}