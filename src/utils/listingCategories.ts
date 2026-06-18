import { normalizeCategoryLabel } from '../config/listingCategories'
import type { Listing } from '../types/listing'

export function getListingCategories(
  listing: Pick<Listing, 'categories' | 'category'>,
): string[] {
  if (Array.isArray(listing.categories) && listing.categories.length > 0) {
    return listing.categories.map(normalizeCategoryLabel)
  }
  const legacy = listing.category?.trim()
  return legacy ? [normalizeCategoryLabel(legacy)] : []
}

export function formatListingCategoriesLabel(
  listing: Pick<Listing, 'categories' | 'category'>,
): string {
  return getListingCategories(listing).join(' • ')
}

export function listingMatchesCategory(
  listing: Pick<Listing, 'categories' | 'category'>,
  category: string,
): boolean {
  return getListingCategories(listing).includes(normalizeCategoryLabel(category))
}
