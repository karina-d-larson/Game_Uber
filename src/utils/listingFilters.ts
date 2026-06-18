import type { ExchangeOption, Listing, ListingPurpose } from '../types/listing'
import { toExchangeOption, toListingPurpose } from './listingMapping'
import { getListingCategories, listingMatchesCategory } from './listingCategories'
export type ListingFilterState = {
  search: string
  category: string | null
  exchangeOption: ExchangeOption | null
  listingPurpose: ListingPurpose
}

function resolveListingPurpose(listing: Listing): ListingPurpose {
  return listing.listingPurpose ?? toListingPurpose(undefined, listing.listingType)
}

function matchesExchangeFilter(
  listing: Listing,
  filter: ExchangeOption | null,
): boolean {
  if (!filter) return true

  const purpose = resolveListingPurpose(listing)

  if (purpose === 'request') {
    return (listing.requestOptions ?? []).includes(filter)
  }

  return listing.arrangementType === filter
}

/**
 * Client-side feed filters. FIREBASE TODO: move primary filters into fetchListings query.
 */
export function filterListings(
  listings: Listing[],
  filters: ListingFilterState,
): Listing[] {
  const query = filters.search.trim().toLowerCase()

  return listings.filter((listing) => {
    const purpose = resolveListingPurpose(listing)
    if (purpose !== filters.listingPurpose) return false

    if (filters.category && !listingMatchesCategory(listing, filters.category)) {
      return false
    }

    if (!matchesExchangeFilter(listing, filters.exchangeOption)) {
      return false
    }

    if (!query) return true

    const categories = getListingCategories(listing)

    return (
      listing.title.toLowerCase().includes(query) ||
      listing.description.toLowerCase().includes(query) ||
      listing.category.toLowerCase().includes(query) ||
      categories.some((cat) => cat.toLowerCase().includes(query)) ||
      listing.ownerName.toLowerCase().includes(query)
    )
  })
}

/** @deprecated Legacy filter value — maps `free` to `borrow`. */
export function normalizeExchangeFilterValue(
  value: unknown,
): ExchangeOption | null {
  if (value == null) return null
  return toExchangeOption(value) ?? null
}
