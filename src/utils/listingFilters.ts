import type { ArrangementType, Listing, ListingType } from '../types/listing'

export type ListingFilterState = {
  search: string
  category: string | null
  arrangementType: ArrangementType | null
  listingType: ListingType
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
    const type = listing.listingType ?? listing.listingMode
    if (type !== filters.listingType) return false

    if (filters.category && listing.category !== filters.category) {
      return false
    }

    if (
      filters.arrangementType &&
      listing.arrangementType !== filters.arrangementType
    ) {
      return false
    }

    if (!query) return true

    return (
      listing.title.toLowerCase().includes(query) ||
      listing.description.toLowerCase().includes(query) ||
      listing.category.toLowerCase().includes(query) ||
      listing.ownerName.toLowerCase().includes(query)
    )
  })
}
