import type { Listing } from '../types/listing'
import { GameCard } from './GameCard'

type ListingsFeedProps = {
  listings: Listing[]
  emptyMessage?: string
}

/**
 * Phase 1 marketplace grid — renders GameCard components from mock data.
 */
export function ListingsFeed({
  listings,
  emptyMessage = 'No listings match your filters yet.',
}: ListingsFeedProps) {
  if (listings.length === 0) {
    return (
      <p className="py-xl text-center text-body-md text-on-surface-variant">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-xl md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <GameCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
