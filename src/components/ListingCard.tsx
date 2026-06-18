import { Link } from 'react-router-dom'
import type { Listing } from '../types/listing'
import { MaterialIcon } from './MaterialIcon'
import {
  formatRequestOptionLabel,
  getArrangementBadgeClasses,
  getOfferCardSummary,
  getRequestStatusLabel,
} from '../utils/listingDisplay'
import { formatListingCategoriesLabel } from '../utils/listingCategories'
import { isOfferListing, isRequestListing } from '../utils/listingHelpers'
import { getListingImageUrls } from '../utils/listingMedia'

type ListingCardProps = {
  listing: Listing
}

function OfferListingCard({ listing }: ListingCardProps) {
  const hero = getListingImageUrls(listing)[0] ?? ''
  const summary = getOfferCardSummary(listing)
  const categoriesLabel = formatListingCategoriesLabel(listing)

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
            <div className="flex h-full w-full flex-col items-center justify-center bg-surface-container-high text-on-surface-variant">
              <MaterialIcon name="casino" className="text-5xl opacity-40" />
            </div>
          )}

          {listing.arrangementType && (
            <div
              className={`absolute top-md right-md rounded-full px-md py-1 font-label-md text-label-md ${getArrangementBadgeClasses(listing.arrangementType)}`}
            >
              {summary.split(' • ')[0]}
            </div>
          )}

          {listing.tutorialUrl && (
            <div className="absolute bottom-md left-md rounded-full bg-surface/90 px-md py-1 font-label-md text-label-md text-secondary shadow-sm backdrop-blur-sm">
              Tutorial available
            </div>
          )}
        </div>

        <div className="p-md">
          <CardUserRow listing={listing} />
          <GameTitleBlock
            title={listing.title}
            categoriesLabel={categoriesLabel}
            description={listing.description}
          />
          <CardFooter summary={summary} />
        </div>
      </Link>
    </article>
  )
}

function RequestListingCard({ listing }: ListingCardProps) {
  const requestOptions = listing.requestOptions ?? []
  const categoriesLabel = formatListingCategoriesLabel(listing)
  const statusLabel = getRequestStatusLabel(listing.availability)

  return (
    <article className="group overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low shadow-sm transition-shadow hover:shadow-md">
      <Link to={`/listings/${listing.id}`} state={{ listing }} className="block p-md">
        <div className="mb-sm flex items-center justify-between gap-sm">
          <span className="rounded-full bg-tertiary-fixed-dim px-md py-1 font-label-md text-label-md text-on-tertiary-fixed">
            Requesting
          </span>
        </div>

        <GameTitleBlock
          title={listing.title}
          categoriesLabel={categoriesLabel}
          description={listing.description}
        />

        {requestOptions.length > 0 && (
          <div className="mb-md flex flex-wrap gap-xs">
            {requestOptions.map((option) => (
              <span
                key={option}
                className="rounded-full bg-surface-container-high px-md py-1 font-label-md text-label-md text-on-surface-variant"
              >
                {formatRequestOptionLabel(option)}
              </span>
            ))}
          </div>
        )}

        <CardUserRow listing={listing} />
        <CardFooter summary={statusLabel} />
      </Link>
    </article>
  )
}

function GameTitleBlock({
  title,
  categoriesLabel,
  description,
}: {
  title: string
  categoriesLabel: string
  description: string
}) {
  return (
    <>
      <h3 className="mb-xs font-headline-md text-headline-md">{title}</h3>
      {categoriesLabel && (
        <p className="mb-sm text-label-md text-on-surface-variant">{categoriesLabel}</p>
      )}
      {description.trim() && (
        <p className="mb-md line-clamp-2 text-body-md text-on-surface-variant">{description}</p>
      )}
    </>
  )
}

function CardUserRow({ listing }: { listing: Listing }) {
  return (
    <div className="mb-sm flex items-center gap-sm">
      <div className="h-8 w-8 shrink-0 rounded-full border border-outline-variant bg-surface-container-high" />
      <div className="min-w-0">
        <p className="font-semibold text-body-md">{listing.ownerName}</p>
        {listing.location && (
          <p className="truncate text-label-md text-on-surface-variant">{listing.location}</p>
        )}
      </div>
    </div>
  )
}

function CardFooter({ summary }: { summary: string }) {
  return (
    <div className="mt-auto flex items-center justify-between gap-sm pt-sm">
      <span className="font-bold text-headline-md text-secondary">{summary}</span>
      <span className="shrink-0 rounded-lg bg-secondary px-xl py-2 font-semibold text-body-md text-on-primary">
        View
      </span>
    </div>
  )
}

export function ListingCard({ listing }: ListingCardProps) {
  if (isRequestListing(listing)) {
    return <RequestListingCard listing={listing} />
  }

  if (isOfferListing(listing)) {
    return <OfferListingCard listing={listing} />
  }

  return <OfferListingCard listing={listing} />
}
