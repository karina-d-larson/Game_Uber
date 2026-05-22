import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CategoryChips } from '../components/CategoryChips'
import { ListingCard } from '../components/ListingCard'
import { MarketplaceToggle } from '../components/MarketplaceToggle'
import { Navbar } from '../components/Navbar'
import { MaterialIcon } from '../components/MaterialIcon'
import { useListings } from '../context/ListingsContext'
import type { ArrangementType, ListingMode } from '../types/listing'
import { filterListings } from '../utils/listingFilters'

const ARRANGEMENT_FILTERS: { label: string; value: ArrangementType | null }[] = [
  { label: 'All types', value: null },
  { label: 'Rent', value: 'rent' },
  { label: 'Trade', value: 'trade' },
  { label: 'Free lend', value: 'free' },
]

export function DashboardPage() {
  const { listings, loading } = useListings()
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
    <>
      <Navbar searchValue={search} onSearchChange={setSearch} variant="feed" />

      <main className="mx-auto max-w-screen-xl px-gutter-mobile py-md pb-24 md:px-gutter-desktop">
        <CategoryChips selected={category} onSelect={setCategory} />

        <section className="custom-scrollbar flex gap-sm overflow-x-auto py-sm">
          {ARRANGEMENT_FILTERS.map((filter) => {
            const isActive = arrangementType === filter.value
            return (
              <button
                key={filter.label}
                type="button"
                onClick={() => setArrangementType(filter.value)}
                className={
                  isActive
                    ? 'rounded-full bg-secondary px-md py-xs font-label-md text-label-md whitespace-nowrap text-on-secondary'
                    : 'rounded-full bg-surface-container-high px-md py-xs font-label-md text-label-md whitespace-nowrap text-on-surface-variant hover:bg-surface-container-highest'
                }
              >
                {filter.label}
              </button>
            )
          })}
        </section>

        <MarketplaceToggle mode={listingMode} onChange={setListingMode} />

        {loading ? (
          <p className="py-xl text-center text-body-md text-on-surface-variant">
            Loading listings…
          </p>
        ) : visibleListings.length === 0 ? (
          <p className="py-xl text-center text-body-md text-on-surface-variant">
            No listings match your filters yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-xl md:grid-cols-2 lg:grid-cols-3">
            {visibleListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>

      <Link
        to="/listings/new"
        className="fixed right-6 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-white shadow-lg transition-transform active:scale-90 duration-200"
        aria-label="Create listing"
      >
        <MaterialIcon name="add" className="text-[32px]" />
      </Link>
    </>
  )
}
