import { useMemo, useState } from 'react'
import { CategoryChips } from '../components/CategoryChips'
import { ListingsFeed } from '../components/ListingsFeed'
import { ListingSkeleton } from '../components/ListingSkeleton'
import { EmptyState } from '../components/EmptyState'
import { MarketplaceToggle } from '../components/MarketplaceToggle'
import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { useListings } from '../context/ListingsContext'
import type { ExchangeOption, ListingPurpose } from '../types/listing'
import { getExchangeFilterOptions } from '../utils/listingDisplay'
import { filterListings } from '../utils/listingFilters'

/**
 * Marketplace feed — reads listings from ListingsContext (localStorage + mocks via listingService).
 *
 * FIREBASE TODO (teammate): no page changes needed if listingService.fetchListings uses Firestore.
 */
export function DashboardPage() {
  const { listings, loading, error, refreshListings } = useListings()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [exchangeOption, setExchangeOption] = useState<ExchangeOption | null>(null)
  const [listingPurpose, setListingPurpose] = useState<ListingPurpose>('offer')

  const exchangeFilters = useMemo(
    () => getExchangeFilterOptions(listingPurpose),
    [listingPurpose],
  )

  const visibleListings = useMemo(
    () =>
      filterListings(listings, {
        search,
        category,
        exchangeOption,
        listingPurpose,
      }),
    [listings, search, category, exchangeOption, listingPurpose],
  )

  function handlePurposeChange(purpose: ListingPurpose) {
    setListingPurpose(purpose)
    setExchangeOption(null)
  }

  const emptyTitle = listingPurpose === 'offer' ? 'No offers found' : 'No requests found'

  return (
    <Page
      header={
        <PageHeader
          variant="feed"
          searchValue={search}
          onSearchChange={setSearch}
        />
      }
    >
      <CategoryChips selected={category} onSelect={setCategory} />

      <MarketplaceToggle purpose={listingPurpose} onChange={handlePurposeChange} />

      <section
        className="custom-scrollbar flex gap-sm overflow-x-auto py-sm"
        aria-label="Exchange filters"
      >
        <button
          type="button"
          onClick={() => setExchangeOption(null)}
          className={
            exchangeOption === null
              ? 'min-h-11 rounded-full bg-secondary px-md py-xs font-label-md text-label-md whitespace-nowrap text-on-secondary'
              : 'min-h-11 rounded-full bg-surface-container-high px-md py-xs font-label-md text-label-md whitespace-nowrap text-on-surface-variant hover:bg-surface-container-highest'
          }
        >
          All types
        </button>
        {exchangeFilters.map((filter) => {
          const isActive = exchangeOption === filter.value
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setExchangeOption(filter.value)}
              className={
                isActive
                  ? 'min-h-11 rounded-full bg-secondary px-md py-xs font-label-md text-label-md whitespace-nowrap text-on-secondary'
                  : 'min-h-11 rounded-full bg-surface-container-high px-md py-xs font-label-md text-label-md whitespace-nowrap text-on-surface-variant hover:bg-surface-container-highest'
              }
            >
              {filter.label}
            </button>
          )
        })}
      </section>

      {error ? (
        <div className="py-xl">
          <EmptyState
            title="Could not load listings"
            description={error}
            action={
              <button
                type="button"
                onClick={() => void refreshListings()}
                className="min-h-11 rounded-lg bg-secondary px-lg py-3 font-label-md text-label-md text-on-secondary shadow-sm transition-all hover:opacity-90 active:scale-95"
              >
                Try again
              </button>
            }
          />
        </div>
      ) : loading ? (
        <div className="py-md">
          <ListingSkeleton count={6} />
        </div>
      ) : visibleListings.length === 0 ? (
        <div className="py-xl">
          <EmptyState
            title={emptyTitle}
            description="Try changing your search or filters, or create a listing from the Create tab."
          />
        </div>
      ) : (
        <ListingsFeed listings={visibleListings} />
      )}
    </Page>
  )
}
