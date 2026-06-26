import { getInitials, isDisplayableAvatarUrl } from '../utils/avatarDisplay'

type AvatarProps = {
  displayName: string
  username: string
  avatar?: string
  className?: string
  imageClassName?: string
  alt?: string
}

export function Avatar({
  displayName,
  username,
  avatar,
  className = 'h-12 w-12',
  imageClassName = 'rounded-full object-cover',
  alt = '',
}: AvatarProps) {
  if (isDisplayableAvatarUrl(avatar)) {
    return (
      <img
        src={avatar}
        alt={alt || `${displayName} avatar`}
        className={`${className} ${imageClassName}`}
      />
    )
  }

  const initials = getInitials(displayName, username)

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-secondary-container font-semibold text-on-secondary-container ${className}`}
      aria-hidden={alt ? undefined : true}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
    >
      {initials}
    </div>
  )
}
