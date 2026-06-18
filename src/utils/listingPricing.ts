import type { ExchangeOption } from '../types/listing'

type PriceArrangement = ExchangeOption | 'free'

/** Display price for cards/detail (may be denormalized in Firestore). */
export function formatListingPrice(
  arrangementType: PriceArrangement | undefined,
  pricePerDay?: number,
): string | undefined {
  if (!arrangementType) return undefined
  if (arrangementType === 'trade') return 'Trade Only'
  if (arrangementType === 'free' || arrangementType === 'borrow') return 'Free'
  if (pricePerDay != null && pricePerDay > 0) return `$${pricePerDay}/day`
  if (arrangementType === 'rent') return 'Contact for price'
  return undefined
}

export function getListingPriceLabel(listing: {
  listingPurpose?: 'offer' | 'request'
  arrangementType?: ExchangeOption
  price?: string
  pricePerDay?: number
  availability: string
}): string {
  if (listing.listingPurpose === 'request') {
    return listing.availability === 'available' ? 'Looking for game' : 'Request closed'
  }

  return (
    listing.price ??
    formatListingPrice(listing.arrangementType, listing.pricePerDay) ??
    (listing.availability === 'available' ? 'Available' : 'Unavailable')
  )
}
