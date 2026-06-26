import type { AuthUser } from '../types/user'
import { Avatar } from './Avatar'
import { MaterialIcon } from './MaterialIcon'

type ProfileHeaderProps = {
  user: AuthUser
  showPhoto?: boolean
}

export function ProfileHeader({ user, showPhoto = true }: ProfileHeaderProps) {
  return (
    <section className="flex flex-col items-center gap-lg rounded-xl bg-surface-container-lowest p-lg custom-shadow md:flex-row md:items-start">
      {showPhoto && (
        <div className="relative">
          <Avatar
            displayName={user.displayName}
            username={user.username}
            avatar={user.avatar}
            className="h-32 w-32 border-4 border-surface-container-high text-headline-lg md:h-40 md:w-40"
            alt="Your profile photo"
          />
        </div>
      )}
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
      </div>
    </section>
  )
}
