import type { ExchangeOption, Listing, ListingAvailability } from '../types/listing'

type BadgeOption = ExchangeOption | 'free'

/** Feed exchange filter chip labels — purpose-aware wording. */
export function getExchangeFilterOptions(
  purpose: 'offer' | 'request',
): { label: string; value: ExchangeOption }[] {
  if (purpose === 'offer') {
    return [
      { label: 'Rent out', value: 'rent' },
      { label: 'Trade', value: 'trade' },
      { label: 'Lend for free', value: 'borrow' },
    ]
  }

  return [
    { label: 'Open to renting', value: 'rent' },
    { label: 'Open to trading', value: 'trade' },
    { label: 'Open to borrowing', value: 'borrow' },
  ]
}

/** Offer listing arrangement label (cards, detail). */
export function formatOfferArrangementLabel(type: ExchangeOption): string {
  switch (type) {
    case 'rent':
      return 'Rent out'
    case 'trade':
      return 'Trade'
    case 'borrow':
      return 'Lend for free'
  }
}

/** Request listing option chip label. */
export function formatRequestOptionLabel(option: ExchangeOption): string {
  switch (option) {
    case 'rent':
      return 'Open to renting'
    case 'trade':
      return 'Open to trading'
    case 'borrow':
      return 'Open to borrowing'
  }
}

/** Offer card/detail footline, e.g. "Rent out • $5/day". */
export function getOfferCardSummary(listing: Listing): string {
  if (!listing.arrangementType) {
    return listing.availability === 'available' ? 'Available' : 'Unavailable'
  }

  const label = formatOfferArrangementLabel(listing.arrangementType)

  if (listing.arrangementType === 'rent') {
    if (listing.pricePerDay != null && listing.pricePerDay > 0) {
      return `${label} • $${listing.pricePerDay}/day`
    }
    if (listing.price?.trim()) {
      return `${label} • ${listing.price}`
    }
  }

  return label
}

/** Request listing status label for cards/detail (maps from availability). */
export function getRequestStatusLabel(availability: ListingAvailability): string {
  return availability === 'available' ? 'Still looking' : 'Request closed'
}
export function formatRequestOptionsSummary(listing: Listing): string {
  const labels = (listing.requestOptions ?? []).map(formatRequestOptionLabel)
  if (labels.length === 0) return 'Options not specified'
  return labels.join(', ')
}

/** Badge styles from the prototype listing cards. */
export function getArrangementBadgeClasses(type: BadgeOption): string {
  switch (type) {
    case 'rent':
      return 'bg-secondary text-white'
    case 'trade':
      return 'bg-tertiary-fixed-dim text-on-tertiary-fixed'
    case 'free':
    case 'borrow':
      return 'bg-secondary-fixed text-on-secondary-fixed'
    default:
      return 'bg-secondary text-white'
  }
}

export function getArrangementBadgeLabel(type: BadgeOption): string {
  if (type === 'rent' || type === 'trade' || type === 'borrow') {
    return formatOfferArrangementLabel(type)
  }
  if (type === 'free') return 'Lend for free'
  return 'Listing'
}

export function formatArrangementDetail(type: BadgeOption): string {
  if (type === 'rent' || type === 'trade' || type === 'borrow') {
    return formatOfferArrangementLabel(type)
  }
  if (type === 'free') return 'Lend for free'
  return type
}

export function getOwnerDistance(listing: Listing): string {
  const location = listing.location?.trim()
  if (!location) return ''
  return location
}
