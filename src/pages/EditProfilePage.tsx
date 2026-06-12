import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthField } from '../components/auth/AuthField'
import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../routes/paths'
import { UserServiceError, getProfile, updateProfile } from '../services/userService'

export function EditProfilePage() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState('')
  const [bio, setBio] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return

    const sessionUser = user
    let cancelled = false

    async function load() {
      setLoading(true)
      setFormError(null)
      try {
        const profile = await getProfile(sessionUser.id)
        if (cancelled) return
        setDisplayName(profile?.displayName ?? sessionUser.displayName)
        setUsername(profile?.username ?? sessionUser.username)
        setAvatar(profile?.avatar ?? sessionUser.avatar)
        setBio(profile?.bio ?? '')
      } catch {
        if (!cancelled) {
          setDisplayName(sessionUser.displayName)
          setUsername(sessionUser.username)
          setAvatar(sessionUser.avatar)
          setBio(sessionUser.bio ?? '')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) return null

  const currentUser = user

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!displayName.trim()) next.displayName = 'Display name is required.'
    if (!username.trim()) next.username = 'Username is required.'
    else if (username.trim().length < 3) {
      next.username = 'Username must be at least 3 characters.'
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
      await updateProfile(currentUser.id, {
        displayName,
        username,
        avatar,
        bio,
      })
      await refreshProfile()
      navigate(ROUTES.profile, { replace: true })
    } catch (error) {
      if (error instanceof UserServiceError) {
        setFormError(error.message)
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Page header={<PageHeader variant="create" title="Edit profile" back="history" />}>
        <p className="text-body-md text-on-surface-variant">Loading…</p>
      </Page>
    )
  }

  return (
    <Page header={<PageHeader variant="create" title="Edit profile" back="history" />}>
      <form className="mx-auto w-full max-w-(--container-md) space-y-lg" onSubmit={handleSubmit} noValidate>
        {formError && (
          <p
            className="rounded-lg border border-error/30 bg-error/5 px-md py-sm text-body-md text-error"
            role="alert"
          >
            {formError}
          </p>
        )}

        <AuthField
          id="edit-display-name"
          label="Display name"
          value={displayName}
          onChange={setDisplayName}
          placeholder="Your name"
          error={fieldErrors.displayName}
          autoComplete="name"
        />

        <AuthField
          id="edit-username"
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="boardgame_guru"
          error={fieldErrors.username}
          autoComplete="username"
        />

        <AuthField
          id="edit-avatar"
          label="Avatar URL (optional)"
          value={avatar}
          onChange={setAvatar}
          placeholder="https://…"
          error={fieldErrors.avatar}
        />

        <div>
          <label
            htmlFor="edit-bio"
            className="mb-2 block font-label-md text-label-md text-on-surface-variant"
          >
            Bio (optional)
          </label>
          <textarea
            id="edit-bio"
            className="boardlink-field min-h-[6rem] resize-y"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others about your collection and lending style…"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-secondary py-4 text-lg font-bold text-on-secondary shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </Page>
  )
}
