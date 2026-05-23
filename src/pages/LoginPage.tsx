import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthField } from '../components/auth/AuthField'
import { useAuth } from '../context/AuthContext'
import { AuthServiceError } from '../services/authService'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!email.trim()) next.email = 'Email is required.'
    if (!password) next.password = 'Password is required.'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/', { replace: true })
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
        <h1 className="font-display-lg text-display-lg text-primary">Welcome back</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Sign in to browse and lend board games near you.
        </p>
      </div>

      <form className="space-y-lg" onSubmit={handleSubmit} noValidate>
        {formError && (
          <p
            className="rounded-lg border border-error/30 bg-error/5 px-md py-sm text-body-md text-error"
            role="alert"
          >
            {formError}
          </p>
        )}

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
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-secondary py-4 text-lg font-bold text-on-secondary shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center font-body-md text-body-md text-on-surface-variant">
        New to BoardLink?{' '}
        <Link to="/signup" className="font-semibold text-secondary hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  )
}
