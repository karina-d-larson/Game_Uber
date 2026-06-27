import type { Listing } from '../types/listing'
import { getListingCategories } from './listingCategories'

/** Lowercase, strip punctuation, collapse whitespace for forgiving text match. */
export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleWords(title: string): string[] {
  return normalizeSearchText(title).split(' ').filter(Boolean)
}

/**
 * True when the listing matches a search query against title and categories.
 * Supports partial substring match and per-word close matches (prefix / includes).
 */
export function listingMatchesSearch(listing: Listing, rawQuery: string): boolean {
  const query = normalizeSearchText(rawQuery)
  if (!query) return true

  const title = normalizeSearchText(listing.title)
  const categories = getListingCategories(listing).map(normalizeSearchText)

  if (title.includes(query)) return true

  if (categories.some((cat) => cat.includes(query))) return true

  const tokens = query.split(' ').filter(Boolean)
  if (tokens.length === 0) return true

  const words = titleWords(listing.title)

  return tokens.every(
    (token) =>
      title.includes(token) ||
      categories.some((cat) => cat.includes(token)) ||
      words.some((word) => word.startsWith(token) || token.startsWith(word)),
  )
}
