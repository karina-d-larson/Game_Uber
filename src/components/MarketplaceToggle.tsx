import type { ListingMode } from '../types/listing'

type MarketplaceToggleProps = {
  mode: ListingMode
  onChange: (mode: ListingMode) => void
}

export function MarketplaceToggle({ mode, onChange }: MarketplaceToggleProps) {
  return (
    <section className="my-xl flex justify-center">
      <div className="flex rounded-xl bg-surface-container-low p-1">
        <button
          type="button"
          onClick={() => onChange('lending')}
          className={
            mode === 'lending'
              ? 'rounded-lg bg-surface px-xl py-2 font-semibold text-body-md text-secondary shadow-sm'
              : 'rounded-lg px-xl py-2 font-medium text-body-md text-on-surface-variant'
          }
        >
          UP FOR LENDING
        </button>
        <button
          type="button"
          onClick={() => onChange('wanted')}
          className={
            mode === 'wanted'
              ? 'rounded-lg bg-surface px-xl py-2 font-semibold text-body-md text-secondary shadow-sm'
              : 'rounded-lg px-xl py-2 font-medium text-body-md text-on-surface-variant'
          }
        >
          WANTED TO RENT
        </button>
      </div>
    </section>
  )
}
