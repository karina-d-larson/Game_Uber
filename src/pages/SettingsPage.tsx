import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthField } from '../components/auth/AuthField'
import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { LISTING_CATEGORY_OPTIONS } from '../config/listingCategories'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../routes/paths'
import {
  AuthServiceError,
  changePassword,
  isEmailPasswordUser,
} from '../services/authService'
import {
  UserServiceError,
  getPreferences,
  updatePreferences,
} from '../services/userService'
import type { PreferredListingType, UserPreferences } from '../types/user'
import { DEFAULT_USER_PREFERENCES } from '../types/user'

const LISTING_TYPE_OPTIONS: { value: PreferredListingType; label: string }[] = [
  { value: 'lending', label: 'Offers' },
  { value: 'wanted', label: 'Requests' },
]

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [logoutError, setLogoutError] = useState<string | null>(null)
  const [isEmailUser, setIsEmailUser] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (!user) return

    let cancelled = false
    const uid = user.id

    void (async () => {
      setLoading(true)
      try {
        const prefs = await getPreferences(uid)
        if (!cancelled) setPreferences(prefs)
      } catch {
        if (!cancelled) setPreferences(DEFAULT_USER_PREFERENCES)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  useEffect(() => {
    setIsEmailUser(isEmailPasswordUser())
  }, [user?.id])

  if (!user) return null

  const currentUser = user

  function toggleListingType(value: PreferredListingType) {
    setPreferences((current) => {
      const has = current.preferredListingTypes.includes(value)
      const preferredListingTypes = has
        ? current.preferredListingTypes.filter((type) => type !== value)
        : [...current.preferredListingTypes, value]
      return { ...current, preferredListingTypes }
    })
    setSaveMessage(null)
  }

  function toggleCategory(category: string) {
    setPreferences((current) => {
      const has = current.preferredCategories.includes(category)
      const preferredCategories = has
        ? current.preferredCategories.filter((item) => item !== category)
        : [...current.preferredCategories, category]
      return { ...current, preferredCategories }
    })
    setSaveMessage(null)
  }

  async function handleSavePreferences(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setSaveMessage(null)

    if (preferences.preferredListingTypes.length === 0) {
      setFormError('Select at least one preference (Offers or Requests).')
      return
    }

    setSaving(true)
    try {
      const saved = await updatePreferences(currentUser.id, preferences)
      setPreferences(saved)
      setSaveMessage('Preferences saved.')
    } catch (error) {
      if (error instanceof UserServiceError) {
        setFormError(error.message)
      } else {
        setFormError('Could not save preferences. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault()
    setPasswordError(null)
    setPasswordMessage(null)

    if (!currentPassword) {
      setPasswordError('Current password is required.')
      return
    }
    if (!newPassword) {
      setPasswordError('New password is required.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setChangingPassword(true)
    try {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage('Password updated.')
    } catch (error) {
      if (error instanceof AuthServiceError) {
        setPasswordError(error.message)
      } else {
        setPasswordError('Could not change password. Please try again.')
      }
    } finally {
      setChangingPassword(false)
    }
  }

  async function handleLogout() {
    setLogoutError(null)
    setLoggingOut(true)
    try {
      await logout()
      navigate(ROUTES.login, { replace: true })
    } catch {
      setLogoutError('Could not sign out. Please try again.')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <Page header={<PageHeader variant="create" title="Settings" back="history" />}>
      <div className="mx-auto w-full max-w-(--container-md) space-y-xl">
        <section className="space-y-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg custom-shadow">
          <h2 className="font-headline-md text-headline-md text-primary">Account</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Signed in as <span className="text-on-surface">{user.email}</span>
          </p>
          {logoutError && (
            <p className="rounded-lg border border-error/30 bg-error/5 px-md py-sm text-body-md text-error" role="alert">
              {logoutError}
            </p>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="rounded-lg border border-outline-variant px-lg py-3 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-60"
          >
            {loggingOut ? 'Signing out…' : 'Log out'}
          </button>
        </section>

        <section className="space-y-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg custom-shadow">
          <h2 className="font-headline-md text-headline-md text-primary">Password</h2>
          {isEmailUser ? (
            <form className="space-y-md" onSubmit={handleChangePassword} noValidate>
              {passwordError && (
                <p
                  className="rounded-lg border border-error/30 bg-error/5 px-md py-sm text-body-md text-error"
                  role="alert"
                >
                  {passwordError}
                </p>
              )}
              {passwordMessage && (
                <p
                  className="rounded-lg border border-secondary/30 bg-secondary/5 px-md py-sm text-body-md text-secondary"
                  role="status"
                >
                  {passwordMessage}
                </p>
              )}
              <AuthField
                id="settings-current-password"
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={setCurrentPassword}
                autoComplete="current-password"
              />
              <AuthField
                id="settings-new-password"
                label="New password"
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
              />
              <AuthField
                id="settings-confirm-password"
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
              />
              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-lg bg-secondary px-lg py-3 font-label-md text-label-md text-on-secondary transition-colors hover:brightness-110 disabled:opacity-60"
              >
                {changingPassword ? 'Updating…' : 'Change password'}
              </button>
            </form>
          ) : (
            <p className="font-body-md text-body-md text-on-surface-variant">
              Password is managed by Google.
            </p>
          )}
        </section>

        <section className="space-y-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg custom-shadow">
          <h2 className="font-headline-md text-headline-md text-primary">Profile</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Update your display name, username, bio, and avatar.
          </p>
          <Link
            to={ROUTES.editProfile}
            className="inline-flex min-h-11 items-center rounded-lg bg-secondary px-lg py-3 font-label-md text-label-md text-on-secondary transition-colors hover:brightness-110"
          >
            Edit profile
          </Link>
        </section>

        <form
          className="space-y-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg custom-shadow"
          onSubmit={handleSavePreferences}
          noValidate
        >
          <h2 className="font-headline-md text-headline-md text-primary">Preferences</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Choose what you want to see in your feed and on your profile.
          </p>

          {loading ? (
            <p className="text-body-md text-on-surface-variant">Loading preferences…</p>
          ) : (
            <>
              {formError && (
                <p className="rounded-lg border border-error/30 bg-error/5 px-md py-sm text-body-md text-error" role="alert">
                  {formError}
                </p>
              )}
              {saveMessage && (
                <p className="rounded-lg border border-secondary/30 bg-secondary/5 px-md py-sm text-body-md text-secondary" role="status">
                  {saveMessage}
                </p>
              )}

              <div>
                <p className="mb-sm font-label-md text-label-md text-on-surface-variant">
                  Preferred listing types
                </p>
                <p className="mb-sm text-label-md text-on-surface-variant">
                  Show offers (games people have) and/or requests (games people are looking for).
                </p>
                <div className="flex flex-col gap-sm sm:flex-row">
                  {LISTING_TYPE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-sm rounded-lg border border-outline-variant px-md py-sm"
                    >
                      <input
                        type="checkbox"
                        checked={preferences.preferredListingTypes.includes(option.value)}
                        onChange={() => toggleListingType(option.value)}
                      />
                      <span className="font-body-md text-body-md">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-sm font-label-md text-label-md text-on-surface-variant">
                  Favorite categories (optional)
                </p>
                <div className="flex flex-wrap gap-sm">
                  {LISTING_CATEGORY_OPTIONS.map((category) => (
                    <label
                      key={category}
                      className="flex cursor-pointer items-center gap-xs rounded-full border border-outline-variant px-md py-1"
                    >
                      <input
                        type="checkbox"
                        checked={preferences.preferredCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                      />
                      <span className="font-body-md text-body-md">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-md rounded-lg border border-outline-variant px-md py-sm">
                <span className="font-body-md text-body-md">Show profile photo on my profile</span>
                <input
                  type="checkbox"
                  checked={preferences.showProfilePhoto}
                  onChange={(e) => {
                    setPreferences((current) => ({
                      ...current,
                      showProfilePhoto: e.target.checked,
                    }))
                    setSaveMessage(null)
                  }}
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-md rounded-lg border border-outline-variant px-md py-sm">
                <span className="font-body-md text-body-md">Show my following list on my profile</span>
                <input
                  type="checkbox"
                  checked={preferences.showFollowingList}
                  onChange={(e) => {
                    setPreferences((current) => ({
                      ...current,
                      showFollowingList: e.target.checked,
                    }))
                    setSaveMessage(null)
                  }}
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-secondary py-3 font-bold text-on-secondary transition-all hover:brightness-110 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save preferences'}
              </button>
            </>
          )}
        </form>

        <section className="space-y-sm rounded-xl border border-outline-variant bg-surface-container-low p-lg">
          <h2 className="font-headline-md text-headline-md text-primary">Privacy</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Your email is only shown to you in Account settings. Other members see your display
            name, username, and bio on your profile.
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Use the preferences above to hide your profile photo or following list from your
            public profile when those features are enabled.
          </p>
        </section>
      </div>
    </Page>
  )
}
