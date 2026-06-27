import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { buildLoginRedirect, getReturnPathFromLocation } from '../utils/authRedirect'

/**
 * Redirect guests to login with return path, or run the signed-in callback.
 * Returns true when the user is authenticated and the action may proceed.
 */
export function useRequireAuth() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback(
    (onAuthed?: () => void): boolean => {
      if (user) {
        onAuthed?.()
        return true
      }

      const from = getReturnPathFromLocation(location)
      const target = buildLoginRedirect(from)
      navigate(target.pathname, {
        replace: false,
        state: target.state,
      })
      return false
    },
    [user, navigate, location],
  )
}
