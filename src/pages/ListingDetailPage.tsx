import { Link, useLocation, useParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { MaterialIcon } from '../components/MaterialIcon'
import { getListingById } from '../data/listings'
import type { Listing } from '../types/listing'
import { formatArrangementDetail } from '../utils/listingDisplay'

type DetailLocationState = {
  listing?: Listing
}

export function ListingDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const state = location.state as DetailLocationState | null

  // Phase 1: listing from Link state, or mock getListingById (sync).
  // FIREBASE TODO: on mount, if !state?.listing && id, call
  //   listingService.getListingById(id) or useListings().getListingById(id)
  // and show loading while fetching. See docs/FIREBASE_INTEGRATION.md
  const listing = state?.listing ?? (id ? getListingById(id) : undefined)

  if (!listing) {
    return (
      <div className="min-h-dvh bg-background text-on-background">
        <Navbar variant="detail" />
        <main className="mx-auto max-w-screen-xl px-gutter-mobile py-xl md:px-gutter-desktop">
          <p className="font-headline-md text-headline-md">Listing not found</p>
          <Link to="/" className="mt-md text-secondary hover:underline">
            Back to dashboard
          </Link>
        </main>
      </div>
    )
  }

  const gallery = listing.gallery ?? [listing.image]
  const heroImage = gallery[0] ?? listing.image
  const thumbs = gallery.slice(1, 4)
  const priceAmount =
    listing.pricePerDay != null ? `$${listing.pricePerDay}` : listing.price.split('/')[0]

  return (
    <div className="min-h-dvh bg-background text-on-background">
      <Navbar variant="detail" />

      <main className="mx-auto max-w-screen-xl px-gutter-mobile pb-32 md:px-gutter-desktop">
        <div className="mt-md grid grid-cols-1 gap-lg md:grid-cols-12">
          <div className="space-y-md md:col-span-7">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-lg">
              <img
                className="h-full w-full object-cover"
                alt=""
                src={heroImage}
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="rounded-full border border-outline-variant bg-surface/90 px-3 py-1 font-label-md text-label-md text-secondary shadow-sm backdrop-blur-sm">
                  Available
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
                  <span className="font-display-lg text-display-lg text-secondary">
                    {priceAmount}
                  </span>
                  {listing.arrangementType === 'rent' && (
                    <span className="block font-body-md text-body-md text-on-surface-variant">
                      per day
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
                {listing.players && (
                  <div className="flex items-center gap-xs rounded-md bg-surface-container px-2 py-1">
                    <MaterialIcon
                      name="group"
                      className="text-sm text-on-surface-variant"
                    />
                    <span className="font-label-md text-label-md text-on-surface-variant">
                      {listing.players}
                    </span>
                  </div>
                )}
                {listing.playTime && (
                  <div className="flex items-center gap-xs rounded-md bg-surface-container px-2 py-1">
                    <MaterialIcon
                      name="schedule"
                      className="text-sm text-on-surface-variant"
                    />
                    <span className="font-label-md text-label-md text-on-surface-variant">
                      {listing.playTime}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-lg space-y-sm">
                <div className="flex items-center justify-between border-b border-outline-variant py-sm">
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    Arrangement
                  </span>
                  <span className="font-headline-md text-headline-md text-primary">
                    {formatArrangementDetail(listing.arrangementType)}
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
            </div>

            <div className="flex items-center gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
              <div className="relative">
                <img
                  className="h-16 w-16 rounded-full object-cover"
                  alt=""
                  src={listing.owner.avatar}
                />
                {listing.owner.verified && (
                  <div className="absolute -right-1 -bottom-1 rounded-full border-2 border-surface-container-lowest bg-secondary p-1 text-on-primary">
                    <MaterialIcon name="verified" filled className="text-[12px]" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-headline-md text-headline-md text-primary">
                    {listing.owner.name}
                  </span>
                  <div className="flex items-center text-secondary">
                    <MaterialIcon name="star" filled className="text-sm" />
                    <span className="ml-1 font-label-md text-label-md">
                      {listing.owner.rating} ({listing.owner.reviewCount ?? 124})
                    </span>
                  </div>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Superhost • Lender for 2 years
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
                {listing.id === 'catan' && (
                  <>
                    <br />
                    <br />
                    Includes the 5-6 player expansion pack. Perfect for a weekend getaway
                    or a friendly game night. I&apos;m happy to explain the rules if
                    you&apos;re new to the game!
                  </>
                )}
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
                    {listing.location}
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
      </main>
    </div>
  )
}
