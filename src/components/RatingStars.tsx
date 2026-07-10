import { MaterialIcon } from './MaterialIcon'

type RatingStarsProps = {
  rating: number
  max?: number
  className?: string
  iconClassName?: string
}

export function RatingStars({
  rating,
  max = 5,
  className = '',
  iconClassName = 'text-sm',
}: RatingStarsProps) {
  const rounded = Math.round(rating * 2) / 2

  return (
    <div className={`flex text-tertiary-fixed-dim ${className}`} aria-hidden="true">
      {Array.from({ length: max }, (_, index) => {
        const star = index + 1
        const filled = rounded >= star
        const half = !filled && rounded >= star - 0.5

        return (
          <MaterialIcon
            key={star}
            name={filled ? 'star' : half ? 'star_half' : 'star_outline'}
            filled={filled || half}
            className={iconClassName}
          />
        )
      })}
    </div>
  )
}
