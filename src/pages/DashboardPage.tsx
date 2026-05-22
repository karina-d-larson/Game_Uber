import { Link } from 'react-router-dom'
import { MaterialIcon } from '../components/MaterialIcon'

const categories = ['Strategy', 'Party', 'Family', 'Co-op', 'Card Games']

const listings = [
  {
    id: 'catan',
    title: 'Catan (Standard)',
    owner: 'Alex Rivera',
    rating: '4.9',
    distance: '1.2 miles',
    price: '$5/day',
    badge: 'Rent',
    badgeClass: 'bg-secondary text-white',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGWAe1S6-RM9yhP-k4BX0Sj_IGvJ0S9YKjB-RfWNv_9ln7GkmzK2DTgLhd9OZAi0YB6gRCSyu-QbXS4ow5dBYlOiIbYbXF8maPCwDxR-TYogBTyvP41LRYl3QlaUmSunjDkSRljFDmL5VVDtDyuxBEiMAF5_zuJiDrCoQoLUalkZKmB-HlCNUIh8L7yb5-cnQYvzfXPUmtsuqkatkbhqXnWQs_UJbyxIbS6KxV73_slMEYmTEJ-2s2gPt8nA5598o70ImuGJ-mQ9c',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkx0UXK1Lpk2ElXA9ROMqC4wi2ZrOF4-lcXU-qLY9iqetmJiI9RWq9dEMcAVfggnureaO9twDbvxDwLNCFqvKKP7i6wrxOjNnimFSvEdRwRsRRxQzEqy6wp5z0WSDkDSP493C65sTxk041gs2-ADCbEXcEJerjfpTB4lw1M_vd9qUH5kMeRxtnrPi0SAw4Ddywo5DQ3GkCnxWDrN-wN-hZe6zXTmgN67Yt0h9jCUY_VqRM4wXjKTut8c9VndifPzGtn0B3_I8RKzw',
    description:
      'The classic game of discovery, settlement, and trade. Perfect for a game night with 3-4 friends.',
  },
  {
    id: 'wingspan',
    title: 'Wingspan',
    owner: 'Sarah Chen',
    rating: '5.0',
    distance: '0.5 miles',
    price: 'Trade Only',
    badge: 'Trade',
    badgeClass: 'bg-tertiary-fixed-dim text-on-tertiary-fixed',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD6Yhwx7lDmHTISSiirIy1FeIXGAs3t6fhIKBJuxRYq3uq42ib79RkwmoZq3j1-jjoQ90NwkA0yoFSJI7lpUUi3T8gb9ZCSvP1gr3tz_olEwKt3Hfj0AfnS3Sf9V56PKC75fbhegs9s3ovhcVAa7MVZIJVLvrUXq1dKf-jqkYxSi-uUrz66X1nCKAqvof8Pt9hqvwH-mksSenHx5ycUOWlH4uQ4MxwC3NTP7NXRPUHaAcalsSJg89A_b-AqQMQ95eGZKOcYeaUf82Y',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC-CQs5RQSPhiSz-Gy0c8SghfWa7FgmDRfhUotd6gLcWYjpzooEtNz9j0jFkJG7Nr0dMrK8ZCwRat2B12uERCBiq7LCTi4Os5XkrAms9uMv-jNPOHdhQmPfgknpYdu14JrmjAbTNd4324owIHyEG-08WbWcFGb1aeVpRhbpAnGf23uputhqbCdNNOLW5upd95vFSfR3jGgVi_MiMj3Dr50QzgsfotUUOEy_7v2_oICnL6Pk1llPtdc88_OURUlNOzwwLN3b8Y2G0cI',
    description:
      'Competitive bird-collection engine-building game. Mint condition, including Swift-Start pack.',
  },
  {
    id: 'azul',
    title: 'Azul',
    owner: 'Marcus Thorne',
    rating: '4.8',
    distance: '2.1 miles',
    price: 'Free',
    badge: 'Free Lend',
    badgeClass: 'bg-secondary-fixed text-on-secondary-fixed',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCJ3kwk0l6v1BjaJTuygd7o3m5_rFbt-r_vX1iIQRJqCG4_9RHvwo_sSSm9aNzQYonGh0k-hf52Fdkvby_7O7pqBuGVYU09QvBArYoJJxPyNCxpiWqViAjWknZApWW4b3tudvucA0IlzzZXMu5lqrgYk2JX8bgjWGncduOhBmfZ8HUQORT01bzI0cQnMdka7Q2NFKctjpQXDtKCib0ackW0sOQ9mAtrdIuPQJZrrSq-EaBiCFw0bXekXIpVo6zInSHmHYUkhPRV4BY',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBP2MPi-06oKxYsopQL3fsvc-foEMm7EoTE-KuSmWGdJGd6RPcX3KDQ73jN2BAC21Xy_hHveoVrjjb1WgSB8SG1YebLaq_oY-b0t3kjIgReFFF4C5ONgPxZBvu0_2a9OjLXrkHCWrZMYJk6VxpVnFNcackljOTFsrv1ZdHparqKhvrIjY_Hb10IpylL_CaFHLG72PLSNxcbsQJGicU-vH5k6KMuPembQXFvZVfQ3sMPUfAswyRXwsWYjsJAoe-o9opZ8ARvX6ADmM8',
    description:
      'Tactile tile-placement game based on Portuguese palace walls. Fast and easy to learn.',
  },
]

export function DashboardPage() {
  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-surface shadow-sm dark:bg-surface">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-md py-sm">
          <span className="font-display-lg text-display-lg text-secondary dark:text-secondary-fixed">
            BoardLink
          </span>
          <div className="flex items-center gap-base">
            <div className="relative hidden items-center md:flex">
              <MaterialIcon
                name="search"
                className="absolute left-3 text-on-surface-variant"
              />
              <input
                className="w-64 rounded-full border-none bg-surface-container-low py-2 pr-4 pl-10 font-body-md text-body-md focus:ring-2 focus:ring-secondary"
                placeholder="Search games..."
                type="search"
              />
            </div>
            <button
              type="button"
              className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low active:scale-95 dark:text-primary-fixed"
            >
              <MaterialIcon name="search" />
            </button>
            <button
              type="button"
              className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low active:scale-95 dark:text-primary-fixed"
            >
              <MaterialIcon name="tune" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-gutter-mobile py-md pb-24 md:px-gutter-desktop">
        <section className="custom-scrollbar flex gap-sm overflow-x-auto py-sm">
          {categories.map((category, index) => (
            <button
              key={category}
              type="button"
              className={
                index === 0
                  ? 'rounded-full bg-primary px-lg py-sm font-label-md text-label-md whitespace-nowrap text-on-primary active:scale-95'
                  : 'rounded-full bg-surface-container-high px-lg py-sm font-label-md text-label-md whitespace-nowrap text-on-surface-variant hover:bg-surface-container-highest active:scale-95'
              }
            >
              {category}
            </button>
          ))}
        </section>

        <section className="my-xl flex justify-center">
          <div className="flex rounded-xl bg-surface-container-low p-1">
            <button
              type="button"
              className="rounded-lg bg-surface px-xl py-2 font-semibold text-body-md text-secondary shadow-sm"
            >
              UP FOR LENDING
            </button>
            <button
              type="button"
              className="rounded-lg px-xl py-2 font-medium text-body-md text-on-surface-variant"
            >
              WANTED TO RENT
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-xl md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <article
              key={listing.id}
              className="group overflow-hidden rounded-xl bg-surface shadow-sm transition-shadow hover:shadow-md"
            >
              <Link to={`/games/${listing.id}`} className="block">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={listing.image}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className={`absolute top-md right-md rounded-full px-md py-1 font-label-md text-label-md ${listing.badgeClass}`}
                  >
                    {listing.badge}
                  </div>
                </div>
                <div className="p-md">
                  <div className="mb-sm flex items-center justify-between">
                    <div className="flex items-center gap-sm">
                      <img
                        src={listing.avatar}
                        alt=""
                        className="h-8 w-8 rounded-full border border-outline-variant object-cover"
                      />
                      <div>
                        <p className="font-semibold text-body-md">{listing.owner}</p>
                        <div className="flex items-center gap-xs">
                          <MaterialIcon
                            name="star"
                            filled
                            className="text-[14px] text-secondary"
                          />
                          <span className="text-label-md text-on-surface-variant">
                            {listing.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-label-md text-on-surface-variant">
                      {listing.distance}
                    </span>
                  </div>
                  <h3 className="mb-xs font-headline-md text-headline-md">
                    {listing.title}
                  </h3>
                  <p className="mb-md line-clamp-2 text-body-md text-on-surface-variant">
                    {listing.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-headline-md text-secondary">
                      {listing.price}
                    </span>
                    <span className="rounded-lg bg-secondary px-xl py-2 font-semibold text-body-md text-on-primary">
                      Request
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </main>

      <Link
        to="/listings/new"
        className="fixed right-6 bottom-24 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-white shadow-lg transition-transform active:scale-90"
        aria-label="Create listing"
      >
        <MaterialIcon name="add" className="text-[32px]" />
      </Link>
    </>
  )
}
