/**
 * Shared listing types — used by UI and Firebase service layer.
 * Firestore field mapping: docs/FIREBASE_INTEGRATION.md
 * When adding Firestore fields (e.g. ownerId, createdAt), extend types here
 * and map in src/services/listingService.ts (mapDocToListing).
 */

/** How the listing is offered (matches prototype badges / filters). */
export type ArrangementType = 'rent' | 'trade' | 'free'

/** Marketplace feed toggle: lending vs wanted posts. */
export type ListingMode = 'lending' | 'wanted'

export type ListingOwner = {
  name: string
  username?: string
  rating: number
  reviewCount?: number
  avatar: string
  verified?: boolean
  tagline?: string
}

export type Listing = {
  id: string
  title: string
  category: string
  condition: string
  arrangementType: ArrangementType
  listingMode: ListingMode
  /** Display price, e.g. "$5/day", "Trade Only", "Free" */
  price: string
  pricePerDay?: number
  description: string
  owner: ListingOwner
  location: string
  rating: number
  image: string
  gallery?: string[]
  players?: string
  playTime?: string
  meetupPreferences?: string
}

export type CreateListingInput = {
  title: string
  category: string
  condition: string
  arrangementType: ArrangementType
  listingMode: ListingMode
  pricePerDay?: number
  description: string
  location: string
  meetupPreferences?: string
  image?: string
}
