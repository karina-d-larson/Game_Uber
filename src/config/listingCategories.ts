/**
 * Static category options for marketplace filters and create form.
 *
 * FIREBASE TODO (optional): load from Firestore `config/categories` or keep static.
 */
export const LISTING_CATEGORY_OPTIONS = [
  'Strategy',
  'Party',
  'Family',
  'Co-op',
  'Card Game',
  'Deck Building',
  'Engine Building',
  'Social Deduction',
  'Role Playing',
  'Puzzle',
  'Abstract',
  'Trivia',
  'Dexterity',
  'Negotiation',
  'Word Game',
  'Economic',
] as const

export type ListingCategory = (typeof LISTING_CATEGORY_OPTIONS)[number]

/** Map legacy stored values to current option labels. */
export const LEGACY_CATEGORY_LABELS: Record<string, string> = {
  'Card Games': 'Card Game',
}

export function normalizeCategoryLabel(value: string): string {
  return LEGACY_CATEGORY_LABELS[value] ?? value
}
