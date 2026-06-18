import type { Listing } from '../types/listing'
import {
  formatOfferArrangementLabel,
  formatRequestOptionLabel,
} from './listingDisplay'

export function isOfferListing(listing: Pick<Listing, 'listingPurpose'>): boolean {
  return listing.listingPurpose === 'offer'
}

export function isRequestListing(listing: Pick<Listing, 'listingPurpose'>): boolean {
  return listing.listingPurpose === 'request'
}

/** Human-readable labels for a listing's exchange options. */
export function getExchangeLabels(listing: Listing): string[] {
  if (isRequestListing(listing)) {
    return (listing.requestOptions ?? []).map(formatRequestOptionLabel)
  }
  if (listing.arrangementType) {
    return [formatOfferArrangementLabel(listing.arrangementType)]
  }
  return []
}
