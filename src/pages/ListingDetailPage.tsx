import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { ROUTES } from '../routes/paths'
import { MaterialIcon } from '../components/MaterialIcon'
import { Avatar } from '../components/Avatar'
import { FollowButton } from '../components/FollowButton'
import { useListings } from '../context/ListingsContext'
import type { Listing } from '../types/listing'
import type { UserProfile } from '../types/user'
import { formatArrangementDetail, formatRequestOptionsSummary } from '../utils/listingDisplay'
import { formatListingCategoriesLabel } from '../utils/listingCategories'
import { isOfferListing, isRequestListing } from '../utils/listingHelpers'
import { getListingImageUrls } from '../utils/listingMedia'
import { useAuth } from '../context/AuthContext'
import { useRequireAuth } from '../hooks/useRequireAuth'
import * as listingService from '../services/listingService'
import { getProfile } from '../services/userService'

// FIREBASE TODO: keep this page free of Firebase SDK imports.
// Read/write listing data only via listingService and useListings context actions.

type DetailLocationState = {
  listing?: Listing
}

export function ListingDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as DetailLocationState | null
  const { updateListing, deleteListing, findListingById } = useListings()
  const { user } = useAuth()
  const requireAuth = useRequireAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [listing, setListing] = useState<Listing | null>(
    state?.listing ?? (id ? findListingById(id) : undefined) ?? null,
  )
  const [notFound, setNotFound] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [busy, setBusy] = useState<'delete' | 'markUnavailable' | null>(null)
  const [ownerProfile, setOwnerProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!id) return
      setLoading(true)
      setError(null)
      setNotFound(false)
      try {
        const fresh = await listingService.getListingById(id)
        if (cancelled) return
        if (!fresh) {
          setNotFound(true)
          setListing(null)
        } else {
          setListing(fresh)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load listing.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!listing?.ownerId) {
      setOwnerProfile(null)
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const profile = await getProfile(listing.ownerId)
        if (!cancelled) setOwnerProfile(profile)
      } catch {
        if (!cancelled) setOwnerProfile(null)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [listing?.ownerId])

  const isOwner = useMemo(() => {
    if (!listing || !user) return false
    return listing.ownerId === user.id
  }, [listing, user])

  if (loading && !listing) {
    return (
      <Page header={<PageHeader variant="stack" back="history" />} footerSpace="none">
        <p className="font-body-md text-on-surface-variant">Loading listing…</p>
      </Page>
    )
  }

  if (error && !listing) {
    return (
      <Page header={<PageHeader variant="stack" back="history" />} footerSpace="none">
        <p className="font-headline-md text-headline-md">Could not load listing</p>
        <p className="mt-sm text-body-md text-on-surface-variant">{error}</p>
        <Link to={ROUTES.home} className="mt-md inline-block min-h-11 text-secondary hover:underline">
          Back to home
        </Link>
      </Page>
    )
  }

  if (notFound || !listing) {
    return (
      <Page header={<PageHeader variant="stack" back="history" />} footerSpace="none">
        <p className="font-headline-md text-headline-md">Listing not found</p>
        <Link to={ROUTES.home} className="mt-md inline-block min-h-11 text-secondary hover:underline">
          Back to home
        </Link>
      </Page>
    )
  }

  const isOffer = isOfferListing(listing)
  const isRequest = isRequestListing(listing)
  const gallery = isOffer ? getListingImageUrls(listing) : []
  const heroImage = gallery[0] ?? ''
  const thumbs = gallery.slice(1, 4)
  const showOfferPrice =
    isOffer &&
    listing.arrangementType === 'rent' &&
    ((listing.pricePerDay != null && listing.pricePerDay > 0) ||
      Boolean(listing.price?.trim()))
  const priceAmount =
    showOfferPrice && listing.pricePerDay != null && listing.pricePerDay > 0
      ? `$${listing.pricePerDay}`
      : showOfferPrice && listing.price?.trim()
        ? listing.price.replace(/\/day$/, '').trim()
        : null
  const availabilityLabel =
    listing.availability === 'available'
      ? isRequest
        ? 'Still looking'
        : 'Available'
      : isRequest
        ? 'Request closed'
        : 'Unavailable'
  const categoriesLabel = formatListingCategoriesLabel(listing)
  const hasDescription = listing.description.trim().length > 0

  async function handleDelete() {
    if (!id) return
    if (!confirm('Delete this listing? This cannot be undone.')) return
    setBusy('delete')
    try {
      await deleteListing(id)
      navigate(ROUTES.home, { replace: true })
    } finally {
      setBusy(null)
      setShowActions(false)
    }
  }

  async function handleMarkUnavailable() {
    if (!id || !listing) return
    setBusy('markUnavailable')
    try {
      const updated = await updateListing(id, {
        availability: listing.availability === 'available' ? 'unavailable' : 'available',
      })
      setListing(updated)
    } finally {
      setBusy(null)
      setShowActions(false)
    }
  }

  function handleEdit() {
    if (!id) return
    navigate(ROUTES.editListing(id), { state: { listing } })
  }

  function handleGuestAction() {
    requireAuth()
  }

  const infoPanel = (
    <div className="space-y-md">
      {isRequest && (
        <div className="flex flex-wrap items-center gap-sm">
          <span className="rounded-full bg-tertiary-fixed-dim px-md py-1 font-label-md text-label-md text-on-tertiary-fixed">
            Requesting
          </span>
          <span className="rounded-full border border-outline-variant bg-surface px-md py-1 font-label-md text-label-md text-secondary">
            {availabilityLabel}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-md">
        <h1 className="font-display-lg text-display-lg text-primary">{listing.title}</h1>
        <div className="shrink-0 text-right">
          {isOffer && showOfferPrice && priceAmount ? (
            <>
              <span className="font-display-lg text-display-lg text-secondary">{priceAmount}</span>
              <span className="block font-body-md text-body-md text-on-surface-variant">
                per day
              </span>
            </>
          ) : isRequest ? (
            <span className="font-body-md text-body-md text-secondary">Looking for</span>
          ) : null}
        </div>
      </div>

      {categoriesLabel && (
        <p className="text-label-md text-on-surface-variant">{categoriesLabel}</p>
      )}

      {isOffer && (
        <div className="flex flex-wrap gap-sm">
          <span className="rounded-full border border-outline-variant bg-surface px-md py-1 font-label-md text-label-md text-secondary">
            {availabilityLabel}
          </span>
          <span className="rounded-full border border-outline-variant bg-surface px-md py-1 font-label-md text-label-md text-on-surface-variant">
            {listing.condition}
          </span>
        </div>
      )}

      <div className="space-y-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-md">
        {isOffer ? (
          <>
            <div className="flex items-center justify-between border-b border-outline-variant py-sm">
              <span className="font-body-md text-body-md text-on-surface-variant">
                How to share
              </span>
              <span className="font-headline-md text-headline-md text-primary">
                {listing.arrangementType
                  ? formatArrangementDetail(listing.arrangementType)
                  : 'Offer'}
              </span>
            </div>
            <div className="flex items-center justify-between py-sm">
              <span className="font-body-md text-body-md text-on-surface-variant">
                Condition
              </span>
              <span className="font-headline-md text-headline-md text-primary">
                {listing.condition}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-outline-variant py-sm">
              <span className="font-body-md text-body-md text-on-surface-variant">
                Open to
              </span>
              <span className="font-headline-md text-headline-md text-primary">
                {formatRequestOptionsSummary(listing)}
              </span>
            </div>
            <div className="flex items-center justify-between py-sm">
              <span className="font-body-md text-body-md text-on-surface-variant">
                Status
              </span>
              <span className="font-headline-md text-headline-md text-primary">
                {availabilityLabel}
              </span>
            </div>
          </>
        )}
      </div>

      {!isOwner && (
        <div className="space-y-sm">
          {isOffer ? (
            <>
              <button
                type="button"
                onClick={handleGuestAction}
                className="w-full rounded-lg bg-secondary py-md font-headline-md text-headline-md text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
              >
                Request Game
              </button>
              <button
                type="button"
                onClick={handleGuestAction}
                className="w-full rounded-lg bg-surface-container-high py-md font-headline-md text-headline-md text-on-surface transition-all hover:bg-surface-container-highest active:scale-95"
              >
                Message Owner
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleGuestAction}
                className="w-full rounded-lg bg-secondary py-md font-headline-md text-headline-md text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
              >
                I have this game
              </button>
              <button
                type="button"
                onClick={handleGuestAction}
                className="w-full rounded-lg bg-surface-container-high py-md font-headline-md text-headline-md text-on-surface transition-all hover:bg-surface-container-highest active:scale-95"
              >
                Message requester
              </button>
            </>
          )}
        </div>
      )}

      {isOwner && (
        <div>
          <button
            type="button"
            onClick={() => setShowActions((v) => !v)}
            className="w-full rounded-lg border border-outline-variant bg-surface py-3 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container"
          >
            Manage listing
          </button>

          {showActions && (
            <div className="mt-sm space-y-sm rounded-lg border border-outline-variant bg-surface-container-lowest p-md">
              <button
                type="button"
                disabled={busy != null}
                onClick={handleEdit}
                className="w-full rounded-lg bg-secondary py-3 font-label-md text-label-md text-on-secondary shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
              >
                Edit listing
              </button>
              <button
                type="button"
                disabled={busy != null}
                onClick={() => void handleMarkUnavailable()}
                className="w-full rounded-lg bg-surface-container-high py-3 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-highest disabled:opacity-60"
              >
                {busy === 'markUnavailable'
                  ? 'Updating…'
                  : isRequest
                    ? listing.availability === 'available'
                      ? 'Close request'
                      : 'Reopen request'
                    : listing.availability === 'available'
                      ? 'Mark unavailable'
                      : 'Mark available'}
              </button>
              <button
                type="button"
                disabled={busy != null}
                onClick={() => void handleDelete()}
                className="w-full rounded-lg bg-error/10 py-3 font-label-md text-label-md text-error transition-colors hover:bg-error/15 disabled:opacity-60"
              >
                {busy === 'delete' ? 'Deleting…' : 'Delete listing'}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
        <Avatar
          displayName={ownerProfile?.displayName ?? listing.ownerName}
          username={ownerProfile?.username ?? listing.ownerName}
          avatar={ownerProfile?.avatar}
          className="h-14 w-14 text-label-md"
          alt={`${listing.ownerName} avatar`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-sm">
            <span className="font-headline-md text-headline-md text-primary">
              {listing.ownerName}
            </span>
            {!isOwner && user && <FollowButton targetUserId={listing.ownerId} />}
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {isRequest ? 'Requester' : 'Owner'} •{' '}
            {new Date(listing.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <Page
      header={<PageHeader variant="stack" title={listing.title} back="history" />}
      footerSpace="large"
      className="!py-0"
    >
      <div className="pb-md">
        <div className="mt-md grid grid-cols-1 gap-lg md:grid-cols-12 md:items-start">
          {isOffer && (
            <div className="space-y-sm md:col-span-5">
              <div className="relative max-h-[280px] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-high shadow-sm md:max-h-[360px] lg:max-h-[400px]">
                {heroImage ? (
                  <img
                    className="h-full max-h-[280px] w-full object-cover md:max-h-[360px] lg:max-h-[400px]"
                    alt={`${listing.title} photo`}
                    src={heroImage}
                  />
                ) : (
                  <div className="flex h-[200px] max-h-[280px] items-center justify-center md:h-[280px] md:max-h-[360px]">
                    <MaterialIcon name="casino" className="text-6xl text-on-surface-variant opacity-40" />
                  </div>
                )}
              </div>

              {thumbs.length > 0 && (
                <div className="grid grid-cols-4 gap-sm">
                  {thumbs.map((src, index) => (
                    <div
                      key={src}
                      className="relative aspect-square max-h-16 overflow-hidden rounded-lg border border-outline-variant bg-surface-container"
                    >
                      <img
                        className="h-full w-full object-cover"
                        alt={`${listing.title} photo ${index + 2}`}
                        src={src}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className={isOffer ? 'md:col-span-7' : 'md:col-span-12'}>{infoPanel}</div>
        </div>

        <div className="mt-xl space-y-lg">
          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
            <h2 className="mb-md font-headline-lg text-headline-lg text-primary">
              {hasDescription ? 'Description' : 'Additional details'}
            </h2>
            {hasDescription ? (
              <p className="font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
                {listing.description}
              </p>
            ) : (
              <p className="font-body-md text-body-md text-on-surface-variant">
                No additional details provided.
              </p>
            )}
          </section>

          {isRequest && listing.location && (
            <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
              <h2 className="mb-sm font-headline-md text-headline-md text-primary">Location</h2>
              <p className="flex items-center gap-xs font-body-md text-body-md text-on-surface-variant">
                <MaterialIcon name="location_on" className="text-sm" />
                {listing.location}
              </p>
            </section>
          )}

          {isOfferListing(listing) && listing.tutorialUrl && (
            <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
              <h2 className="mb-sm font-headline-lg text-headline-lg text-primary">
                Game tutorial video
              </h2>
              <p className="mb-md font-body-md text-body-md text-on-surface-variant">
                Learn how to play before borrowing.
              </p>
              <a
                href={listing.tutorialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg bg-secondary px-lg py-3 font-label-md text-label-md text-on-secondary shadow-sm transition-all hover:opacity-90"
              >
                Watch tutorial
              </a>
            </section>
          )}

          {isOffer && (
            <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
              <h2 className="mb-md font-headline-lg text-headline-lg text-primary">Location</h2>
              <div className="relative h-48 w-full overflow-hidden rounded-xl bg-surface-container md:h-56">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
                  <MaterialIcon name="map" className="text-8xl" />
                </div>
                <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                  <MaterialIcon name="location_on" filled className="text-3xl text-secondary" />
                  <div className="mt-2 rounded-full bg-surface-container-lowest px-3 py-1 font-label-md text-label-md text-primary shadow-md">
                    {listing.location ?? 'Location not provided'}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </Page>
  )
}
