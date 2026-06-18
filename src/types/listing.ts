/**
 * Shared listing types — used by UI and Firebase service layer.
 *
 * GameShelf listing schema (required):
 * {
 *   id,
 *   title,
 *   description,
 *   imageUrls (optional — may be empty),
 *   listingPurpose,
 *   category,
 *   ownerId,
 *   ownerName,
 *   createdAt,
 *   updatedAt,
 *   condition,
 *   availability
 * }
 *
 * Purpose-specific (see listingPurpose):
 * - offer: arrangementType (single exchange option)
 * - request: requestOptions (one or more exchange options)
 *
 * Firebase mapping:
 * - docs/FIREBASE_INTEGRATION.md describes expected Firestore queries + doc fields.
 * - src/services/listingService.ts is responsible for Firestore ↔ Listing mapping.
 */

/** What the user is posting: a game they have vs a game they want. */
export type ListingPurpose = 'offer' | 'request'

/** How a game may be exchanged (rent, trade, or borrow for free). */
export type ExchangeOption = 'rent' | 'trade' | 'borrow'

/**
 * Legacy arrangement input value. Normalized to `borrow` on read/write.
 * @deprecated Prefer `ExchangeOption`; UI may still submit `free` until Phase 2.
 */
export type ArrangementType = ExchangeOption | 'free'

/** @deprecated Feed toggle — derived from listingPurpose. Kept for existing UI. */
export type ListingType = 'lending' | 'wanted'

/** Back-compat alias for older UI code. Prefer `ListingType`. */
export type ListingMode = ListingType

export type ListingAvailability = 'available' | 'unavailable'

export type Listing = {
  id: string
  title: string
  description: string

  imageUrls: string[]

  listingPurpose: ListingPurpose
  /** Primary category — legacy fallback; equals `categories[0]` when set. */
  category: string
  /** Game categories (multi-select). */
  categories?: string[]

  ownerId: string
  ownerName: string

  /** Epoch millis (or Firestore timestamp mapped to epoch millis). */
  createdAt: number
  updatedAt: number

  condition: string
  availability: ListingAvailability

  /** Offer listings: single exchange option. */
  arrangementType?: ExchangeOption

  /** Request listings: one or more acceptable exchange options. */
  requestOptions?: ExchangeOption[]

  // -----------------------------------------------------------------------
  // Legacy fields (kept so existing UI/filters compile until Phase 2+).
  // -----------------------------------------------------------------------
  /** @deprecated Derived from listingPurpose — lending = offer, wanted = request. */
  listingType: ListingType
  listingMode?: ListingMode
  price?: string
  pricePerDay?: number
  location?: string
  meetupPreferences?: string
  /** Offer listings: external tutorial/rules video URL (no upload). */
  tutorialUrl?: string
  image?: string
  gallery?: string[]
}

export type CreateListingInput = {
  title: string
  description: string
  /** @deprecated Use `categories`; kept as `categories[0]` for compatibility. */
  category: string
  categories: string[]

  /** Preferred discriminator for new listings. */
  listingPurpose?: ListingPurpose

  /**
   * @deprecated Use listingPurpose. Still accepted from the current form until Phase 2.
   */
  listingType: ListingType

  condition: string
  availability: ListingAvailability

  /** New images selected by the user (optional; service uploads and returns URLs). */
  imageFiles: File[]

  /** Offer listings: single exchange option (`free` maps to `borrow`). */
  arrangementType?: ArrangementType

  /** Request listings: one or more exchange options. */
  requestOptions?: ExchangeOption[]

  pricePerDay?: number
  location?: string
  meetupPreferences?: string
  /** Offer listings only — http(s) URL to a tutorial or rules video. */
  tutorialUrl?: string
}

export type UpdateListingInput = {
  title?: string
  description?: string
  category?: string
  categories?: string[]

  listingPurpose?: ListingPurpose
  /** @deprecated Use listingPurpose. */
  listingType?: ListingType

  condition?: string
  availability?: ListingAvailability

  /** If provided, replaces the listing imageUrls with newly uploaded URLs. */
  imageFiles?: File[]

  arrangementType?: ArrangementType
  requestOptions?: ExchangeOption[]

  pricePerDay?: number
  location?: string
  meetupPreferences?: string
  tutorialUrl?: string
}
