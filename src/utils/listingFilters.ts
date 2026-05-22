import type { ArrangementType, Listing, ListingMode } from '../types/listing'

export type ListingFilterState = {
  search: string
  category: string | null
  arrangementType: ArrangementType | null
  listingMode: ListingMode
}

/** Filter marketplace listings for the dashboard feed. */
export function filterListings(
  listings: Listing[],
  filters: ListingFilterState,
): Listing[] {
  const query = filters.search.trim().toLowerCase()

  return listings.filter((listing) => {
    if (listing.listingMode !== filters.listingMode) return false

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
      listing.owner.name.toLowerCase().includes(query)
    )
  })
}
