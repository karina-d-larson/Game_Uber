/**
 * Auth state for the React app — calls src/services/authService.ts only.
 *
 * FIREBASE TODO (teammate):
 *   - Replace mock session restore with onAuthStateChanged in useEffect
 *   - Optionally sync Firestore user profile after auth state changes
 *   - Remove reliance on localStorage session (boardlink_auth_session)
 *
 * See: docs/FIREBASE_INTEGRATION.md — Authentication
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authService from '../services/authService'
import type { AuthUser } from '../types/user'

type AuthContextValue = {
  user: AuthUser | null
  /** True while restoring session on app load (splash screen) */
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      setLoading(true)
      try {
        const current = await authService.getCurrentUser()
        if (!cancelled) setUser(current)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void restoreSession()

    // FIREBASE TODO: return unsubscribe from onAuthStateChanged(auth, async (fbUser) => { ... })
    // FIREBASE TODO: keep Firebase SDK calls inside authService; context should only orchestrate app state.
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const signedIn = await authService.login(email, password)
    setUser(signedIn)
  }, [])

  const signup = useCallback(
    async (email: string, password: string, username: string) => {
      const signedUp = await authService.signup(email, password, username)
      setUser(signedUp)
    },
    [],
  )

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
    }),
    [user, loading, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
