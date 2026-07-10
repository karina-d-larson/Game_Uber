import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthField } from '../components/auth/AuthField'
import { AuthDivider, GoogleAuthButton } from '../components/auth/GoogleAuthButton'
import { useAuth } from '../context/AuthContext'
import { AuthServiceError, sendPasswordReset } from '../services/authService'
import { getPostAuthPath } from '../utils/authRedirect'
import { ROUTES } from '../routes/paths'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!email.trim()) next.email = 'Email is required.'
    if (!showForgotPassword && !password) next.password = 'Password is required.'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setResetSent(false)
    if (!validate()) return

    setSubmitting(true)
    try {
      if (showForgotPassword) {
        await sendPasswordReset(email)
        setResetSent(true)
      } else {
        await login(email, password)
        navigate(getPostAuthPath(location.state), { replace: true })
      }
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

  function toggleForgotPassword() {
    setShowForgotPassword((current) => !current)
    setFormError(null)
    setResetSent(false)
    setFieldErrors({})
  }

  return (
    <div className="space-y-xl">
      <div className="space-y-sm text-center md:text-left">
        <h1 className="font-display-lg text-display-lg text-primary">Welcome back</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {showForgotPassword
            ? 'Enter your email and we will send a password reset link.'
            : 'Sign in to browse and lend board games near you.'}
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

      {resetSent && (
        <p
          className="rounded-lg border border-secondary/30 bg-secondary/5 px-md py-sm text-body-md text-secondary"
          role="status"
        >
          If an account exists for that email, a reset link has been sent. Check your inbox.
        </p>
      )}

      {!showForgotPassword && (
        <>
          <GoogleAuthButton disabled={submitting} onError={setFormError} />
          <AuthDivider />
        </>
      )}

      <form className="space-y-lg" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={fieldErrors.email}
          autoComplete="email"
        />

        {!showForgotPassword && (
          <div>
            <AuthField
              id="login-password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              error={fieldErrors.password}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={toggleForgotPassword}
              className="mt-sm font-label-md text-label-md text-secondary hover:underline"
            >
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-secondary py-4 text-lg font-bold text-on-secondary shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        >
          {submitting
            ? showForgotPassword
              ? 'Sending…'
              : 'Signing in…'
            : showForgotPassword
              ? 'Send reset link'
              : 'Sign in'}
        </button>

        {showForgotPassword && (
          <button
            type="button"
            onClick={toggleForgotPassword}
            className="w-full font-label-md text-label-md text-secondary hover:underline"
          >
            Back to sign in
          </button>
        )}
      </form>

      {!showForgotPassword && (
        <p className="text-center font-body-md text-body-md text-on-surface-variant">
          New to GameShelf?{' '}
          <Link to={ROUTES.signup} className="font-semibold text-secondary hover:underline">
            Create an account
          </Link>
        </p>
      )}
    </div>
  )
}
