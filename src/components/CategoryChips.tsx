import { LISTING_CATEGORY_OPTIONS } from '../config/listingCategories'

type CategoryChipsProps = {
  selected: string | null
  onSelect: (category: string | null) => void
}

/**
 * Category filter chips (presentation-only).
 *
 * FIREBASE TODO:
 * - If categories become dynamic, load them in a service/context layer.
 * - Do NOT query Firestore directly in this component.
 */
export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <section className="custom-scrollbar flex gap-sm overflow-x-auto py-sm">
      {LISTING_CATEGORY_OPTIONS.map((category) => {
        const isActive = selected === category
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(isActive ? null : category)}
            className={
              isActive
                ? 'rounded-full bg-primary px-lg py-sm font-label-md text-label-md whitespace-nowrap text-on-primary active:scale-95 transition-transform'
                : 'rounded-full bg-surface-container-high px-lg py-sm font-label-md text-label-md whitespace-nowrap text-on-surface-variant hover:bg-surface-container-highest active:scale-95 transition-transform'
            }
          >
            {category}
          </button>
        )
      })}
    </section>
  )
}
