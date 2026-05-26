/**
 * Shared listing types — used by UI and Firebase service layer.
 *
 * BoardLink MVP listing schema (required):
 * {
 *   id,
 *   title,
 *   description,
 *   imageUrls,
 *   listingType,
 *   category,
 *   ownerId,
 *   ownerName,
 *   createdAt,
 *   condition,
 *   availability
 * }
 *
 * Firebase mapping:
 * - docs/FIREBASE_INTEGRATION.md describes expected Firestore queries + doc fields.
 * - src/services/listingService.ts is responsible for Firestore ↔ Listing mapping.
 */

/** Optional legacy: how the listing is offered (rent/trade/free). */
export type ArrangementType = 'rent' | 'trade' | 'free'

/** Feed toggle: lending vs wanted. */
export type ListingType = 'lending' | 'wanted'

/** Back-compat alias for older UI code. Prefer `ListingType`. */
export type ListingMode = ListingType

export type ListingAvailability = 'available' | 'unavailable'

export type Listing = {
  id: string
  title: string
  description: string

  imageUrls: string[]

  listingType: ListingType
  category: string

  ownerId: string
  ownerName: string

  /** Epoch millis (or Firestore timestamp mapped to epoch millis). */
  createdAt: number

  condition: string
  availability: ListingAvailability

  // -----------------------------------------------------------------------
  // Optional legacy fields (kept so existing UI/styles can be migrated
  // incrementally without breaking compilation).
  // -----------------------------------------------------------------------
  arrangementType?: ArrangementType
  listingMode?: ListingMode
  price?: string
  pricePerDay?: number
  location?: string
  meetupPreferences?: string
  image?: string
  gallery?: string[]
}

export type CreateListingInput = {
  title: string
  description: string
  category: string

  listingType: ListingType
  condition: string
  availability: ListingAvailability

  /** New images selected by the user (service uploads and returns URLs). */
  imageFiles: File[]

  // Optional legacy fields
  arrangementType?: ArrangementType
  pricePerDay?: number
  location?: string
  meetupPreferences?: string
}

export type UpdateListingInput = {
  title?: string
  description?: string
  category?: string

  listingType?: ListingType
  condition?: string
  availability?: ListingAvailability

  /** If provided, replaces the listing imageUrls with newly uploaded URLs. */
  imageFiles?: File[]

  // Optional legacy fields
  arrangementType?: ArrangementType
  pricePerDay?: number
  location?: string
  meetupPreferences?: string
}
