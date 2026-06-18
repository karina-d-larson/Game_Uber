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
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  signup: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
  /** Re-fetch Firestore profile into session state (e.g. after profile edit). */
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Session state for UI. Uses authService.subscribeToAuthChanges as the single
 * auth listener (Firestore profile + cachedUser for getCurrentUser()).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges((nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await authService.login(email, password)
    // subscribeToAuthChanges updates user + cachedUser with Firestore profile
  }, [])

  const loginWithGoogle = useCallback(async () => {
    await authService.loginWithGoogle()
    // subscribeToAuthChanges updates user + cachedUser with Firestore profile
  }, [])

  const signup = useCallback(async (
    email: string,
    password: string,
    username: string,
  ) => {
    await authService.signup(email, password, username)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
  }, [])

  const refreshProfile = useCallback(async () => {
    const updated = await authService.refreshSessionProfile()
    if (updated) setUser(updated)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      loginWithGoogle,
      signup,
      logout,
      refreshProfile,
    }),
    [user, loading, login, loginWithGoogle, signup, logout, refreshProfile],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
