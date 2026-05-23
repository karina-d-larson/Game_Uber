/**
 * AUTH DATA LAYER — swap implementation here for Firebase Authentication
 * ========================================================================
 * Docs: docs/FIREBASE_INTEGRATION.md (Milestone 2)
 *
 * Pages/context must call these functions only (never import Firebase in UI):
 *   - login(email, password)
 *   - signup(email, password, username)
 *   - logout()
 *   - getCurrentUser()
 *
 * FIREBASE TODO (teammate):
 *   1. initialize auth in src/lib/firebase.ts → getAuth(app)
 *   2. login    → signInWithEmailAndPassword(auth, email, password)
 *   3. signup   → createUserWithEmailAndPassword + setDoc(users/{uid}, profile)
 *   4. logout   → signOut(auth)
 *   5. getCurrentUser → onAuthStateChanged or auth.currentUser + Firestore profile fetch
 *   6. Remove mock localStorage keys below when live
 *
 * Persistence (production): Firebase Auth session (browser persistence).
 * Persistence (mock/dev): localStorage session key boardlink_auth_session
 */

import type { AuthUser, LoginInput, SignupInput } from '../types/user'
import { readJson, writeJson } from '../utils/localStorage'

const SESSION_KEY = 'boardlink_auth_session'
const USERS_KEY = 'boardlink_auth_users'

/** DEV ONLY — stores credentials for mock auth. Never use in production. */
type StoredAuthRecord = AuthUser & {
  password: string
}

type AuthSession = {
  userId: string
}

export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthServiceError'
  }
}

const DEFAULT_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDKHIZ20m5AdsPygH7mo9GAuD80aTL1xPNpdImx_PbFWb2frljMf0-fa9nge7jYqMfhFyaoBDh6ebxk3Gw4W7FyskHsCV8GEnP61EJoS7kCkTtOeZ5DoilGGfNxKrkO4uQYnWY68kDyGSEOszS1csnfhTtXjjNVAxzPydRi1ChhsLJL0i2_KYXFjiuG3wqA0yiAkjW2HFNlQk3HJ6pv_AobcvOdPxIVOlOEGe78QMDjrvw8r3MQ9XRbkv05WoJl0boYQlLJFe_Z-7g'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function normalizeUsername(username: string): string {
  return username.trim().replace(/^@+/, '').toLowerCase()
}

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

/**
 * FIREBASE TODO: signInWithEmailAndPassword → map Firebase user + Firestore profile to AuthUser
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
 * FIREBASE TODO: createUserWithEmailAndPassword + users/{uid} document
 */
export async function signup(
  email: string,
  password: string,
  username: string,
): Promise<AuthUser> {
  validateSignupInput({ email, password, username })
  await delay(500)

  const normalizedEmail = normalizeEmail(email)
  const handle = normalizeUsername(username)
  const users = readUsers()

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new AuthServiceError('An account with this email already exists.')
  }
  if (users.some((user) => user.username === handle)) {
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
 * FIREBASE TODO: signOut(auth)
 */
export async function logout(): Promise<void> {
  await delay(200)
  localStorage.removeItem(SESSION_KEY)
}

/**
 * FIREBASE TODO: onAuthStateChanged + optional Firestore users/{uid} fetch
 * Return null when signed out.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  await delay(300)

  const session = readJson<AuthSession>(SESSION_KEY)
  if (!session?.userId) return null

  const record = readUsers().find((user) => user.id === session.userId)
  if (!record) {
    localStorage.removeItem(SESSION_KEY)
    return null
  }

  return toPublicUser(record)
}
