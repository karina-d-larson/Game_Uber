import type { Listing } from '../types/listing'

/** Resolved gallery URLs (canonical `imageUrls` first, then legacy fields). */
export function getListingImageUrls(listing: Listing): string[] {
  if (listing.imageUrls.length > 0) return listing.imageUrls
  if (listing.gallery?.length) return listing.gallery
  if (listing.image) return [listing.image]
  return []
}
