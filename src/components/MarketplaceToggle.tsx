import type { ListingPurpose } from '../types/listing'

type MarketplaceToggleProps = {
  purpose: ListingPurpose
  onChange: (purpose: ListingPurpose) => void
}

export function MarketplaceToggle({ purpose, onChange }: MarketplaceToggleProps) {
  return (
    <section className="my-xl flex justify-center" aria-label="Listing purpose">
      <div className="flex rounded-xl bg-surface-container-low p-1">
        <button
          type="button"
          onClick={() => onChange('offer')}
          className={
            purpose === 'offer'
              ? 'rounded-lg bg-surface px-xl py-2 font-semibold text-body-md text-secondary shadow-sm'
              : 'rounded-lg px-xl py-2 font-medium text-body-md text-on-surface-variant'
          }
        >
          Offers
        </button>
        <button
          type="button"
          onClick={() => onChange('request')}
          className={
            purpose === 'request'
              ? 'rounded-lg bg-surface px-xl py-2 font-semibold text-body-md text-secondary shadow-sm'
              : 'rounded-lg px-xl py-2 font-medium text-body-md text-on-surface-variant'
          }
        >
          Requests
        </button>
      </div>
    </section>
  )
}
