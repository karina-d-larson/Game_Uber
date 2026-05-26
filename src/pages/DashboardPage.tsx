import { useMemo, useState } from 'react'
import { CategoryChips } from '../components/CategoryChips'
import { ListingsFeed } from '../components/ListingsFeed'
import { ListingSkeleton } from '../components/ListingSkeleton'
import { EmptyState } from '../components/EmptyState'
import { MarketplaceToggle } from '../components/MarketplaceToggle'
import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { useListings } from '../context/ListingsContext'
import type { ArrangementType, ListingMode } from '../types/listing'
import { filterListings } from '../utils/listingFilters'

const ARRANGEMENT_FILTERS: { label: string; value: ArrangementType | null }[] = [
  { label: 'All types', value: null },
  { label: 'Rent', value: 'rent' },
  { label: 'Trade', value: 'trade' },
  { label: 'Free lend', value: 'free' },
]

/**
 * Marketplace feed — reads listings from ListingsContext (localStorage + mocks via listingService).
 *
 * FIREBASE TODO (teammate): no page changes needed if listingService.fetchListings uses Firestore.
 */
export function DashboardPage() {
  const { listings, loading, error, refreshListings } = useListings()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [arrangementType, setArrangementType] = useState<ArrangementType | null>(
    null,
  )
  const [listingMode, setListingMode] = useState<ListingMode>('lending')

  const visibleListings = useMemo(
    () =>
      filterListings(listings, {
        search,
        category,
        arrangementType,
        listingMode,
      }),
    [listings, search, category, arrangementType, listingMode],
  )

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

      <section
        className="custom-scrollbar flex gap-sm overflow-x-auto py-sm"
        aria-label="Arrangement filters"
      >
        {ARRANGEMENT_FILTERS.map((filter) => {
          const isActive = arrangementType === filter.value
          return (
            <button
              key={filter.label}
              type="button"
              onClick={() => setArrangementType(filter.value)}
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

      <MarketplaceToggle mode={listingMode} onChange={setListingMode} />

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
            title="No listings yet"
            description="Try adjusting your search or filters, or create a listing from the Create tab."
          />
        </div>
      ) : (
        <ListingsFeed listings={visibleListings} />
      )}
    </Page>
  )
}
