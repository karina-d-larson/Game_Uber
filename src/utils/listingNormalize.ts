import type { Listing, ListingAvailability } from '../types/listing'
import {
  listingPurposeToListingType,
  normalizeListingCategories,
  normalizeOfferArrangement,
  normalizeRequestOptions,
  normalizeTutorialUrl,
  toListingPurpose,
} from './listingMapping'
import { normalizeCategoryLabel } from '../config/listingCategories'

type LegacyListingShape = Partial<Listing> & {
  owner?: { name?: string }
  listingMode?: Listing['listingType']
  image?: string
  gallery?: string[]
  /** Legacy arrangement value before `borrow` rename. */
  arrangementType?: string
}

function toAvailability(value: unknown): ListingAvailability {
  return value === 'unavailable' ? 'unavailable' : 'available'
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

  const listingPurpose = toListingPurpose(
    input.listingPurpose,
    input.listingType ?? input.listingMode,
  )
  const listingType = listingPurposeToListingType(listingPurpose)

  const arrangementType =
    listingPurpose === 'offer'
      ? normalizeOfferArrangement(input.arrangementType)
      : undefined

  const requestOptions =
    listingPurpose === 'request'
      ? normalizeRequestOptions(input.requestOptions, input.arrangementType)
      : undefined

  const { categories, category } = normalizeListingCategories(
    input.categories,
    input.category,
  )

  return {
    id: String(input.id ?? `listing-${createdAt}`),
    title: String(input.title ?? 'Untitled listing'),
    description: String(input.description ?? ''),
    imageUrls,
    listingPurpose,
    listingType,
    category: category ? normalizeCategoryLabel(category) : 'Strategy',
    categories:
      categories.length > 0
        ? categories.map(normalizeCategoryLabel)
        : undefined,
    ownerId: String(input.ownerId ?? 'unknown-owner'),
    ownerName: String(input.ownerName ?? input.owner?.name ?? 'Unknown owner'),
    createdAt,
    updatedAt,
    condition: String(input.condition ?? 'Good'),
    availability: toAvailability(input.availability),
    arrangementType,
    requestOptions,
    price: input.price,
    pricePerDay:
      listingPurpose === 'offer' ? input.pricePerDay : undefined,
    location: input.location,
    meetupPreferences: input.meetupPreferences,
    tutorialUrl:
      listingPurpose === 'offer'
        ? normalizeTutorialUrl(input.tutorialUrl, 'offer')
        : undefined,
  }
}

export function normalizeListings(raw: unknown): Listing[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeListing)
}
