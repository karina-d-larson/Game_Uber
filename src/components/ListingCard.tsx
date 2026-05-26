import { Link } from 'react-router-dom'
import type { Listing } from '../types/listing'
import {
  getArrangementBadgeClasses,
  getArrangementBadgeLabel,
} from '../utils/listingDisplay'

type ListingCardProps = {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const hero = listing.imageUrls[0] ?? listing.image ?? ''

  return (
    <article className="group overflow-hidden rounded-xl bg-surface shadow-sm transition-shadow hover:shadow-md">
      <Link to={`/listings/${listing.id}`} state={{ listing }} className="block">
        <div className="relative h-64 overflow-hidden bg-surface-container-high">
          {hero ? (
            <img
              src={hero}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-surface-container-high" />
          )}

          {listing.arrangementType && (
            <div
              className={`absolute top-md right-md rounded-full px-md py-1 font-label-md text-label-md ${getArrangementBadgeClasses(listing.arrangementType)}`}
            >
              {getArrangementBadgeLabel(listing.arrangementType)}
            </div>
          )}
        </div>

        <div className="p-md">
          <div className="mb-sm flex items-center justify-between">
            <div className="flex items-center gap-sm">
              <div className="h-8 w-8 rounded-full border border-outline-variant bg-surface-container-high object-cover" />
              <div>
                <p className="font-semibold text-body-md">{listing.ownerName}</p>
                <p className="text-label-md text-on-surface-variant">
                  {listing.category}
                </p>
              </div>
            </div>

            {listing.location && (
              <span className="text-label-md text-on-surface-variant">
                {listing.location}
              </span>
            )}
          </div>

          <h3 className="mb-xs font-headline-md text-headline-md">
            {listing.title}
          </h3>
          <p className="mb-md line-clamp-2 text-body-md text-on-surface-variant">
            {listing.description}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <span className="font-bold text-headline-md text-secondary">
              {listing.price ?? (listing.availability === 'available' ? 'Available' : 'Unavailable')}
            </span>
            <span className="rounded-lg bg-secondary px-xl py-2 font-semibold text-body-md text-on-primary">
              View
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

