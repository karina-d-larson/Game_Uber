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

import { auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  /**
   * REAL FIREBASE AUTH LISTENER
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setLoading(false)
        return
      }

      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        username: firebaseUser.email?.split('@')[0] ?? 'user',
        displayName: firebaseUser.email?.split('@')[0] ?? 'User',
        avatar: '',
      })

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const signedIn = await authService.login(email, password)
    setUser(signedIn)
  }, [])

  const signup = useCallback(async (
    email: string,
    password: string,
    username: string,
  ) => {
    const signedUp = await authService.signup(email, password, username)
    setUser(signedUp)
  }, [])

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