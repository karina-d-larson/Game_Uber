import type { Listing, ListingAvailability, ListingType } from '../types/listing'

type LegacyListingShape = Partial<Listing> & {
  owner?: { name?: string }
  listingMode?: ListingType
  image?: string
  gallery?: string[]
}

function toAvailability(value: unknown): ListingAvailability {
  return value === 'unavailable' ? 'unavailable' : 'available'
}

function toListingType(value: unknown, fallback?: ListingType): ListingType {
  if (value === 'wanted' || value === 'lending') return value
  return fallback ?? 'lending'
}

/**
 * DEV FALLBACK: normalizes localStorage / legacy mock shapes.
 * FIREBASE TODO: replace with mapDocToListing in listingService.
 */
export function normalizeListing(raw: unknown): Listing {
  const input = (raw ?? {}) as LegacyListingShape
  const createdAt =
    typeof input.createdAt === 'number' ? input.createdAt : Date.now()
  const updatedAt =
    typeof input.updatedAt === 'number' ? input.updatedAt : createdAt

  const imageUrls =
    Array.isArray(input.imageUrls) && input.imageUrls.length > 0
      ? input.imageUrls.filter((url): url is string => typeof url === 'string')
      : input.gallery?.length
        ? input.gallery
        : input.image
          ? [input.image]
          : []

  const listingType = toListingType(input.listingType, input.listingMode)

  return {
    id: String(input.id ?? `listing-${createdAt}`),
    title: String(input.title ?? 'Untitled listing'),
    description: String(input.description ?? ''),
    imageUrls,
    listingType,
    category: String(input.category ?? 'Strategy'),
    ownerId: String(input.ownerId ?? 'unknown-owner'),
    ownerName: String(input.ownerName ?? input.owner?.name ?? 'Unknown owner'),
    createdAt,
    updatedAt,
    condition: String(input.condition ?? 'Good'),
    availability: toAvailability(input.availability),
    arrangementType: input.arrangementType,
    price: input.price,
    pricePerDay: input.pricePerDay,
    location: input.location,
    meetupPreferences: input.meetupPreferences,
  }
}

export function normalizeListings(raw: unknown): Listing[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeListing)
}
