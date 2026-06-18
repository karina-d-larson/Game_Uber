import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthField } from '../components/auth/AuthField'
import { AuthDivider, GoogleAuthButton } from '../components/auth/GoogleAuthButton'
import { useAuth } from '../context/AuthContext'
import { AuthServiceError } from '../services/authService'
import { getPostAuthPath } from '../utils/authRedirect'

export function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!email.trim()) next.email = 'Email is required.'
    if (!username.trim()) next.username = 'Username is required.'
    else if (username.trim().length < 3) {
      next.username = 'Username must be at least 3 characters.'
    }
    if (!password) next.password = 'Password is required.'
    else if (password.length < 6) {
      next.password = 'Password must be at least 6 characters.'
    }
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      await signup(email, password, username)
      navigate(getPostAuthPath(location.state), { replace: true })
    } catch (error) {
      if (error instanceof AuthServiceError) {
        setFormError(error.message)
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-xl">
      <div className="space-y-sm text-center md:text-left">
        <h1 className="font-display-lg text-display-lg text-primary">Join GameShelf</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Create an account to list games and connect with players.
        </p>
      </div>

      {formError && (
        <p
          className="rounded-lg border border-error/30 bg-error/5 px-md py-sm text-body-md text-error"
          role="alert"
        >
          {formError}
        </p>
      )}

      <GoogleAuthButton
        disabled={submitting}
        onError={setFormError}
      />

      <AuthDivider />

      <form className="space-y-lg" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="signup-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={fieldErrors.email}
          autoComplete="email"
        />

        <AuthField
          id="signup-username"
          label="Username"
          type="text"
          value={username}
          onChange={setUsername}
          placeholder="boardgame_guru"
          error={fieldErrors.username}
          autoComplete="username"
        />

        <AuthField
          id="signup-password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 6 characters"
          error={fieldErrors.password}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-secondary py-4 text-lg font-bold text-on-secondary shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center font-body-md text-body-md text-on-surface-variant">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-secondary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
