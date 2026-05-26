/**
 * Static category options for marketplace filters and create form.
 *
 * FIREBASE TODO (optional): load from Firestore `config/categories` or keep static.
 * Do NOT import mock listing data here — categories are UI config, not seed data.
 */
export const LISTING_CATEGORY_OPTIONS = [
  'Strategy',
  'Party',
  'Family',
  'Co-op',
  'Card Games',
] as const

export type ListingCategory = (typeof LISTING_CATEGORY_OPTIONS)[number]
