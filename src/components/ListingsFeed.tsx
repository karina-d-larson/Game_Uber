import type { Listing } from '../types/listing'
import { ListingCard } from './ListingCard'

type ListingsFeedProps = {
  listings: Listing[]
  emptyMessage?: string
}

/**
 * Marketplace grid — renders listing cards.
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
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
