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
  const [submitting, setSubmitting] = useState(false)

  // Prefill from session user immediately; enrich from Firestore in background.
  // Depends on user.id only — auth enriches user with a new object reference and
  // must not cancel the load effect (that left loading stuck forever).
  useEffect(() => {
    if (!user) return

    setDisplayName(user.displayName)
    setUsername(user.username)
    setAvatar(user.avatar)
    setBio(user.bio ?? '')

    let cancelled = false
    const uid = user.id

    void (async () => {
      try {
        const profile = await getProfile(uid)
        if (cancelled || !profile) return
        setDisplayName(profile.displayName)
        setUsername(profile.username)
        setAvatar(profile.avatar)
        setBio(profile.bio ?? '')
      } catch {
        // AuthContext values are already shown.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user?.id])

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
            className="gameshelf-field min-h-[6rem] resize-y"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others about your collection and how you share games…"
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
