/**
 * AUTH DATA LAYER — Firebase-ready abstraction layer
 * ===================================================
 *
 * RULES:
 * - UI / Pages MUST NOT import Firebase directly
 * - Only these functions are used by the app:
 *     • login()
 *     • signup()
 *     • logout()
 *     • getCurrentUser()
 *
 * CURRENT MODE:
 * - Mock auth using localStorage (DEV ONLY)
 *
 * FUTURE MODE:
 * - Replace internals with Firebase Auth + Firestore
 *
 * FIREBASE MIGRATION (Milestone 2):
 *   1. auth in src/lib/firebase.ts → getAuth(app)
 *   2. login → signInWithEmailAndPassword(auth, email, password)
 *   3. signup → createUserWithEmailAndPassword + setDoc(users/{uid})
 *   4. logout → signOut(auth)
 *   5. getCurrentUser → onAuthStateChanged + Firestore profile fetch
 *   6. remove localStorage usage completely
 *
 * Persistence:
 * - DEV: localStorage session
 * - PROD: Firebase Auth session persistence
 */

import type { AuthUser, LoginInput, SignupInput } from '../types/user'
import { readJson, writeJson } from '../utils/localStorage'

/* =========================================================
   CONSTANTS (NOT MODIFIED)
========================================================= */

const SESSION_KEY = 'boardlink_auth_session'
const USERS_KEY = 'boardlink_auth_users'

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDKHIZ20m5AdsPygH7mo9GAuD80aTL1xPNpdImx_PbFWb2frljMf0-fa9nge7jYqMfhFyaoBDh6ebxk3Gw4W7FyskHsCV8GEnP61EJoS7kCkTtOeZ5DoilGGfNxKrkO4uQYnWY68kDyGSEOszS1csnfhTtXjjNVAxzPydRi1ChhsLJL0i2_KYXFjiuG3wqA0yiAkjW2HFNlQk3HJ6pv_AobcvOdPxIVOlOEGe78QMDjrvw8r3MQ9XRbkv05WoJl0boYQlLJFe_Z-7g'

/* =========================================================
   TYPES (NOT MODIFIED — STILL MOCK SYSTEM)
========================================================= */

type StoredAuthRecord = AuthUser & {
  password: string
}

type AuthSession = {
  userId: string
}

/* =========================================================
   ERROR CLASS (NOT MODIFIED)
========================================================= */

export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthServiceError'
  }
}

/* =========================================================
   UTILITIES (NOT MODIFIED — MOCK HELPERS)
========================================================= */

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function normalizeUsername(username: string): string {
  return username.trim().replace(/^@+/, '').toLowerCase()
}

/* =========================================================
   STORAGE HELPERS (NOT MODIFIED — LOCALSTORAGE MOCK)
========================================================= */

function readUsers(): StoredAuthRecord[] {
  return readJson<StoredAuthRecord[]>(USERS_KEY) ?? []
}

function writeUsers(users: StoredAuthRecord[]): void {
  writeJson(USERS_KEY, users)
}

function toPublicUser(record: StoredAuthRecord): AuthUser {
  const { password: _password, ...user } = record
  return user
}

function createId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `user-${Date.now()}`
}

/* =========================================================
   VALIDATION (NOT MODIFIED)
========================================================= */

function validateLoginInput({ email, password }: LoginInput): void {
  if (!email.trim()) throw new AuthServiceError('Email is required.')
  if (!password) throw new AuthServiceError('Password is required.')
  if (password.length < 6) {
    throw new AuthServiceError('Password must be at least 6 characters.')
  }
}

function validateSignupInput({ email, password, username }: SignupInput): void {
  validateLoginInput({ email, password })

  const handle = normalizeUsername(username)

  if (!handle) throw new AuthServiceError('Username is required.')
  if (handle.length < 3) {
    throw new AuthServiceError('Username must be at least 3 characters.')
  }
  if (!/^[a-z0-9_]+$/.test(handle)) {
    throw new AuthServiceError(
      'Username can only use letters, numbers, and underscores.',
    )
  }
}

/* =========================================================
   AUTH API (STILL MOCK IMPLEMENTATION — TO BE REPLACED)
========================================================= */

/**
 * LOGIN (MOCK)
 * NOT MIGRATED YET → still uses localStorage
 */
export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  validateLoginInput({ email, password })
  await delay(400)

  const normalizedEmail = normalizeEmail(email)
  const users = readUsers()
  const record = users.find((user) => user.email === normalizedEmail)

  if (!record || record.password !== password) {
    throw new AuthServiceError('Invalid email or password.')
  }

  writeJson<AuthSession>(SESSION_KEY, { userId: record.id })
  return toPublicUser(record)
}

/**
 * SIGNUP (MOCK)
 * NOT MIGRATED YET → still uses localStorage
 */
export async function signup(
  email: string,
  password: string,
  username: string,
): Promise<AuthUser> {
  validateSignupInput({ email, password, username })

  const normalizedEmail = normalizeEmail(email)
  const handle = normalizeUsername(username)

  const users = readUsers()

  if (users.some((u) => u.email === normalizedEmail)) {
    throw new AuthServiceError('An account with this email already exists.')
  }

  if (users.some((u) => u.username === handle)) {
    throw new AuthServiceError('This username is already taken.')
  }

  const newUser: StoredAuthRecord = {
    id: createId(),
    email: normalizedEmail,
    username: handle,
    displayName: handle.replace(/_/g, ' '),
    avatar: DEFAULT_AVATAR,
    password,
  }

  writeUsers([...users, newUser])
  writeJson<AuthSession>(SESSION_KEY, { userId: newUser.id })

  return toPublicUser(newUser)
}

/**
 * LOGOUT (MOCK)
 * NOT MIGRATED YET → still uses localStorage
 */
export async function logout(): Promise<void> {
  await delay(200)
  localStorage.removeItem(SESSION_KEY)
}

/**
 * GET CURRENT USER (MOCK)
 * NOT MIGRATED YET → still uses localStorage session lookup
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  await delay(300)

  const session = readJson<AuthSession>(SESSION_KEY)
  if (!session?.userId) return null

  const record = readUsers().find((u) => u.id === session.userId)

  if (!record) {
    localStorage.removeItem(SESSION_KEY)
    return null
  }

  return toPublicUser(record)
}

/* =========================================================
   🔥 MIGRATION STATUS SUMMARY
=========================================================

✔ COMPLETED:
- File structure cleaned
- Validation system intact
- Mock auth fully working
- Firebase migration plan documented

❌ NOT MIGRATED (STILL MOCK):
- login() → still uses localStorage
- signup() → still uses localStorage
- logout() → still uses localStorage
- getCurrentUser() → still uses localStorage
- NO Firebase Auth integration yet
- NO Firestore user profiles yet

🔜 NEXT STEP (Firebase Migration Phase 1):
- Replace login() with signInWithEmailAndPassword
- Connect Firebase Auth session state
- Replace USERS_KEY with Firestore "users" collection
*/