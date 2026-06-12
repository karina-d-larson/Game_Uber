import type { AuthUser } from '../types/user'
import { MaterialIcon } from './MaterialIcon'

type ProfileHeaderProps = {
  user: AuthUser
}

/**
 * Profile hero — data from AuthContext (mock) or Firestore users/{uid} later.
 *
 * FIREBASE TODO: pass Firestore profile fields; keep this component presentational.
 */
export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <section className="flex flex-col items-center gap-lg rounded-xl bg-surface-container-lowest p-lg custom-shadow md:flex-row md:items-start">
      <div className="relative">
        <img
          alt="Avatar"
          className="h-32 w-32 rounded-full border-4 border-surface-container-high object-cover md:h-40 md:w-40"
          src={user.avatar}
        />
        <div className="absolute right-2 bottom-2 flex items-center justify-center rounded-full border-2 border-surface-container-lowest bg-secondary p-1 text-on-secondary">
          <MaterialIcon name="verified" filled className="text-sm" />
        </div>
      </div>
      <div className="flex-1 space-y-sm text-center md:text-left">
        <div className="flex flex-col gap-xs md:flex-row md:items-center md:gap-md">
          <h2 className="font-headline-lg text-headline-lg">{user.displayName}</h2>
          <span className="font-body-md text-body-md text-on-surface-variant">
            @{user.username}
          </span>
          <span className="inline-flex items-center rounded-full bg-secondary-container/10 px-3 py-1 font-label-md text-label-md text-secondary-container">
            Marketplace Member
          </span>
        </div>
        <div className="flex items-center justify-center gap-xs md:justify-start">
          <div className="flex text-secondary">
            <MaterialIcon name="star" filled />
            <MaterialIcon name="star" filled />
            <MaterialIcon name="star" filled />
            <MaterialIcon name="star" filled />
            <MaterialIcon name="star_half" filled />
          </div>
          <span className="font-body-md text-body-md text-on-surface-variant">
            (4.8 rating)
          </span>
        </div>
        {user.bio && (
          <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">
            {user.bio}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-md pt-sm md:justify-start">
          <button
            type="button"
            className="rounded-lg bg-primary px-lg py-2 font-label-md text-label-md text-on-primary active:scale-95 transition-transform"
          >
            Message
          </button>
          <button
            type="button"
            className="rounded-lg border border-outline-variant px-lg py-2 font-label-md text-label-md text-on-surface active:scale-95 transition-transform hover:bg-surface-container-low"
          >
            Follow
          </button>
        </div>
      </div>
    </section>
  )
}
