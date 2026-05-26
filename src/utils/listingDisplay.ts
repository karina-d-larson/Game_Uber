import type { ArrangementType, Listing } from '../types/listing'

/** Badge styles from the prototype listing cards. */
export function getArrangementBadgeClasses(type: ArrangementType): string {
  switch (type) {
    case 'rent':
      return 'bg-secondary text-white'
    case 'trade':
      return 'bg-tertiary-fixed-dim text-on-tertiary-fixed'
    case 'free':
      return 'bg-secondary-fixed text-on-secondary-fixed'
    default:
      return 'bg-secondary text-white'
  }
}

export function getArrangementBadgeLabel(type: ArrangementType): string {
  switch (type) {
    case 'rent':
      return 'Rent'
    case 'trade':
      return 'Trade'
    case 'free':
      return 'Free Lend'
    default:
      return 'Listing'
  }
}

export function formatArrangementDetail(type: ArrangementType): string {
  switch (type) {
    case 'rent':
      return 'Rent'
    case 'trade':
      return 'Trade'
    case 'free':
      return 'Free Lend'
    default:
      return type
  }
}

export function getOwnerDistance(listing: Listing): string {
  const location = listing.location?.trim()
  if (!location) return ''
  return location
}
