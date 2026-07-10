import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/Avatar'
import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../routes/paths'
import {
  UserServiceError,
  getFollowingIds,
  getProfile,
  unfollowUser,
} from '../services/userService'
import type { UserProfile } from '../types/user'

export function FollowingPage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null)

  const loadFollowing = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const ids = await getFollowingIds(user.id)
      const resolved = await Promise.all(ids.map((id) => getProfile(id)))
      setProfiles(resolved.filter((profile): profile is UserProfile => profile != null))
    } catch (err) {
      if (err instanceof UserServiceError) {
        setError(err.message)
      } else {
        setError('Could not load following list.')
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadFollowing()
  }, [loadFollowing])

  async function handleUnfollow(targetUserId: string) {
    setUnfollowingId(targetUserId)
    setError(null)
    try {
      await unfollowUser(targetUserId)
      setProfiles((current) => current.filter((profile) => profile.id !== targetUserId))
    } catch (err) {
      if (err instanceof UserServiceError) {
        setError(err.message)
      } else {
        setError('Could not unfollow user.')
      }
    } finally {
      setUnfollowingId(null)
    }
  }

  if (!user) return null

  return (
    <Page header={<PageHeader variant="create" title="Following" back="history" />}>
      <div className="mx-auto w-full max-w-(--container-md) space-y-lg">
        {error && (
          <p
            className="rounded-lg border border-error/30 bg-error/5 px-md py-sm text-body-md text-error"
            role="alert"
          >
            {error}
          </p>
        )}

        {loading ? (
          <p className="font-body-md text-body-md text-on-surface-variant">Loading…</p>
        ) : profiles.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">
            You are not following anyone yet. Follow someone from a listing to see them here.
          </p>
        ) : (
          <ul className="space-y-md">
            {profiles.map((profile) => (
              <li
                key={profile.id}
                className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md custom-shadow"
              >
                <Avatar
                  displayName={profile.displayName}
                  username={profile.username}
                  avatar={profile.avatar}
                  className="h-12 w-12 text-label-md"
                  alt={`${profile.displayName} avatar`}
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to={ROUTES.userProfile(profile.id)}
                    className="block truncate font-headline-md text-headline-md text-primary hover:underline"
                  >
                    {profile.displayName}
                  </Link>
                  <p className="truncate font-body-md text-body-md text-on-surface-variant">
                    @{profile.username}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={unfollowingId === profile.id}
                  onClick={() => void handleUnfollow(profile.id)}
                  className="shrink-0 rounded-lg border border-outline-variant px-md py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low disabled:opacity-60"
                >
                  {unfollowingId === profile.id ? 'Updating…' : 'Unfollow'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Page>
  )
}
