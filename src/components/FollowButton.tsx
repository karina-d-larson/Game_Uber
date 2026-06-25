import { useEffect, useState } from 'react'
import { UserServiceError, followUser, isFollowing, unfollowUser } from '../services/userService'

type FollowButtonProps = {
  targetUserId: string
  className?: string
}

export function FollowButton({ targetUserId, className = '' }: FollowButtonProps) {
  const [following, setFollowing] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        const result = await isFollowing(targetUserId)
        if (!cancelled) setFollowing(result)
      } catch {
        if (!cancelled) setFollowing(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [targetUserId])

  async function handleClick() {
    setError(null)
    setBusy(true)
    try {
      if (following) {
        await unfollowUser(targetUserId)
        setFollowing(false)
      } else {
        await followUser(targetUserId)
        setFollowing(true)
      }
    } catch (err) {
      if (err instanceof UserServiceError) {
        setError(err.message)
      } else {
        setError('Could not update follow status.')
      }
    } finally {
      setBusy(false)
    }
  }

  if (following === null) {
    return (
      <span className={`font-label-md text-label-md text-on-surface-variant ${className}`}>
        …
      </span>
    )
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={busy}
        onClick={() => void handleClick()}
        className="rounded-lg border border-outline-variant px-lg py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low active:scale-95 disabled:opacity-60"
      >
        {busy ? 'Updating…' : following ? 'Unfollow' : 'Follow'}
      </button>
      {error && (
        <p className="mt-xs text-label-md text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
