import type { ArrangementType } from '../types/listing'

/** Display price for cards/detail (may be denormalized in Firestore). */
export function formatListingPrice(
  arrangementType: ArrangementType | undefined,
  pricePerDay?: number,
): string | undefined {
  if (!arrangementType) return undefined
  if (arrangementType === 'trade') return 'Trade Only'
  if (arrangementType === 'free') return 'Free'
  if (pricePerDay != null && pricePerDay > 0) return `$${pricePerDay}/day`
  if (arrangementType === 'rent') return 'Contact for price'
  return undefined
}

export function getListingPriceLabel(listing: {
  arrangementType?: ArrangementType
  price?: string
  pricePerDay?: number
  availability: string
}): string {
  return (
    listing.price ??
    formatListingPrice(listing.arrangementType, listing.pricePerDay) ??
    (listing.availability === 'available' ? 'Available' : 'Unavailable')
  )
}
