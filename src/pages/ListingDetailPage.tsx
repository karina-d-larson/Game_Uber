import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { ROUTES } from '../routes/paths'
import { MaterialIcon } from '../components/MaterialIcon'
import { useListings } from '../context/ListingsContext'
import type { Listing } from '../types/listing'
import { formatArrangementDetail } from '../utils/listingDisplay'
import { useAuth } from '../context/AuthContext'
import * as listingService from '../services/listingService'

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
  const { updateListing, deleteListing } = useListings()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [listing, setListing] = useState<Listing | null>(state?.listing ?? null)
  const [notFound, setNotFound] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [busy, setBusy] = useState<'delete' | 'markUnavailable' | null>(null)

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

  const gallery = listing.imageUrls.length > 0
    ? listing.imageUrls
    : listing.gallery ?? (listing.image ? [listing.image] : [])
  const heroImage = gallery[0] ?? ''
  const thumbs = gallery.slice(1, 4)
  const priceAmount = listing.pricePerDay != null ? `$${listing.pricePerDay}` : (listing.price ? listing.price.split('/')[0] : '')
  const availabilityLabel = listing.availability === 'available' ? 'Available' : 'Unavailable'

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

  return (
    <Page
      header={<PageHeader variant="stack" title={listing.title} back="history" />}
      footerSpace="large"
      className="!py-0"
    >
      <div className="pb-md">
        <div className="mt-md grid grid-cols-1 gap-lg md:grid-cols-12">
          <div className="space-y-md md:col-span-7">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-lg">
              {heroImage ? (
                <img className="h-full w-full object-cover" alt="" src={heroImage} />
              ) : (
                <div className="h-full w-full bg-surface-container-high" />
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="rounded-full border border-outline-variant bg-surface/90 px-3 py-1 font-label-md text-label-md text-secondary shadow-sm backdrop-blur-sm">
                  {availabilityLabel}
                </span>
                <span className="rounded-full border border-outline-variant bg-surface/90 px-3 py-1 font-label-md text-label-md text-tertiary-fixed-variant shadow-sm backdrop-blur-sm">
                  {listing.condition}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-sm">
              {thumbs.map((src, index) => (
                <div
                  key={src}
                  className="relative aspect-square overflow-hidden rounded-lg border border-outline-variant bg-surface-container"
                >
                  <img className="h-full w-full object-cover" alt="" src={src} />
                  {index === 2 && gallery.length > 4 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/40 font-headline-md text-headline-md text-on-primary">
                      +{gallery.length - 4}
                    </div>
                  )}
                </div>
              ))}
              <div className="flex aspect-square flex-col items-center justify-center overflow-hidden rounded-lg border border-outline-variant bg-surface-container p-2 text-center">
                <MaterialIcon name="videocam" className="text-secondary" />
                <span className="mt-1 text-[10px] font-bold text-on-surface-variant">
                  View Video
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-lg md:col-span-5">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <div className="mb-sm flex items-start justify-between">
                <h1 className="font-display-lg text-display-lg text-primary">
                  {listing.title}
                </h1>
                <div className="text-right">
                  {priceAmount ? (
                    <>
                      <span className="font-display-lg text-display-lg text-secondary">
                        {priceAmount}
                      </span>
                      {listing.arrangementType === 'rent' && (
                        <span className="block font-body-md text-body-md text-on-surface-variant">
                          per day
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      {availabilityLabel}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-md flex flex-wrap gap-sm">
                <div className="flex items-center gap-xs rounded-md bg-surface-container px-2 py-1">
                  <MaterialIcon
                    name="category"
                    className="text-sm text-on-surface-variant"
                  />
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    {listing.category}
                  </span>
                </div>
              </div>

              <div className="mb-lg space-y-sm">
                <div className="flex items-center justify-between border-b border-outline-variant py-sm">
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    Arrangement
                  </span>
                  <span className="font-headline-md text-headline-md text-primary">
                    {listing.arrangementType ? formatArrangementDetail(listing.arrangementType) : 'Listing'}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-outline-variant py-sm">
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    Condition
                  </span>
                  <span className="font-headline-md text-headline-md text-primary">
                    {listing.condition}
                  </span>
                </div>
              </div>

              <div className="space-y-sm">
                <button
                  type="button"
                  className="w-full rounded-lg bg-secondary py-md font-headline-md text-headline-md text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
                >
                  Request Game
                </button>
                <button
                  type="button"
                  className="w-full rounded-lg bg-surface-container-high py-md font-headline-md text-headline-md text-on-surface transition-all hover:bg-surface-container-highest active:scale-95"
                >
                  Message Owner
                </button>
              </div>

              {isOwner && (
                <div className="mt-lg">
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
            </div>

            <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
              <div className="relative h-16 w-16 rounded-full bg-surface-container-high" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-headline-md text-headline-md text-primary">
                    {listing.ownerName}
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Owner • {new Date(listing.createdAt).toLocaleDateString()}
                </p>
                <Link
                  to="/profile"
                  className="mt-1 font-label-md text-label-md text-secondary hover:underline"
                >
                  View full profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-xl grid grid-cols-1 gap-lg md:grid-cols-12">
          <div className="space-y-lg md:col-span-7">
            <section>
              <h2 className="mb-md font-headline-lg text-headline-lg text-primary">
                Detailed Description
              </h2>
              <p className="font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
                {listing.description}
              </p>
            </section>
            <section>
              <h2 className="mb-md font-headline-lg text-headline-lg text-primary">
                Location
              </h2>
              <div className="relative h-64 w-full overflow-hidden rounded-xl bg-surface-container shadow-inner">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
                  <MaterialIcon name="map" className="text-9xl" />
                </div>
                <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                  <MaterialIcon name="location_on" filled className="text-4xl text-secondary" />
                  <div className="mt-2 rounded-full bg-surface-container-lowest px-3 py-1 font-label-md text-label-md text-primary shadow-md">
                    {listing.location ?? 'Location not provided'}
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="md:col-span-5">
            <section className="rounded-xl bg-surface-container-low p-md">
              <h3 className="mb-sm font-headline-md text-headline-md text-primary">
                What borrowers say
              </h3>
              <div className="space-y-md">
                <div className="border-b border-outline-variant pb-md">
                  <div className="mb-xs flex items-center gap-sm">
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      alt=""
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt6mdIDBypkzZaY7RvLmNoyfbG8uN7kzzuSTi6chx0wYGKVwy2yX9ifqMhHyIN8p6R4CGapjQNq8hY7zWLuzWCwOOG3xGFAk7_WNEmxchft3T9DTydPipEkZnesPTGd0LcBmICslCg5VAbK7bRa6cvvH1wQtNS7Ltj-4PjvoBZRaVEv0PNg8rWmcjAu31basqQNEzh3dzvf38FOLZCOL65CnHu7x3Tqw6tJS8MlcBtq-MFhVqQnVL9CksvVCDM2ApJBlSOlLLy6Fw"
                    />
                    <span className="font-label-md text-label-md text-primary">
                      Sarah J.
                    </span>
                    <span className="text-[10px] text-on-surface-variant">
                      • 2 days ago
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    &quot;Game was in perfect condition. Marcus was very flexible with
                    the pickup time!&quot;
                  </p>
                </div>
                <button
                  type="button"
                  className="w-full rounded-lg py-2 text-center font-label-md text-label-md text-secondary transition-colors hover:bg-surface-container"
                >
                  Read all 42 reviews
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Page>
  )
}
