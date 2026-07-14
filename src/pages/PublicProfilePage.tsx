import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ListingsFeed } from '../components/ListingsFeed'
import { ProfileHeader } from '../components/ProfileHeader'
import { RatingStars } from '../components/RatingStars'
import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { useListings } from '../context/ListingsContext'
import { ROUTES } from '../routes/paths'
import { fetchReviewsForUser, summarizeReviews } from '../services/reviewService'
import { getProfile } from '../services/userService'
import type { Review } from '../types/review'
import type { UserProfile } from '../types/user'

function formatReviewDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function PublicProfilePage() {
  const { userId } = useParams()
  const { listings } = useListings()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    let cancelled = false
    void (async () => {
      setProfileLoading(true)
      setProfileError(null)
      try {
        const loaded = await getProfile(userId)
        if (!cancelled) {
          setProfile(loaded)
          if (!loaded) setProfileError('User profile not found.')
        }
      } catch (e) {
        if (!cancelled) {
          setProfileError(e instanceof Error ? e.message : 'Could not load profile.')
          setProfile(null)
        }
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return

    let cancelled = false
    void (async () => {
      setReviewsLoading(true)
      setReviewsError(null)
      try {
        const data = await fetchReviewsForUser(userId)
        if (!cancelled) setReviews(data)
      } catch (e) {
        if (!cancelled) {
          setReviewsError(e instanceof Error ? e.message : 'Could not load reviews.')
        }
      } finally {
        if (!cancelled) setReviewsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [userId])

  const profileListings = useMemo(
    () => listings.filter((listing) => listing.ownerId === userId),
    [listings, userId],
  )
  const summary = summarizeReviews(reviews)

  return (
    <Page header={<PageHeader variant="stack" title="Public Profile" back="history" />} footerSpace="large" className="space-y-xl">
      {profileLoading ? (
        <p className="font-body-md text-body-md text-on-surface-variant">Loading profile…</p>
      ) : profileError || !profile ? (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
          <h1 className="font-headline-lg text-headline-lg text-primary">Profile not found</h1>
          <p className="mt-sm font-body-md text-body-md text-on-surface-variant">
            {profileError ?? 'This user profile is not available.'}
          </p>
          <Link to={ROUTES.home} className="mt-md inline-block min-h-11 text-secondary hover:underline">
            Back to listings
          </Link>
        </div>
      ) : (
        <>
          <ProfileHeader
            user={profile}
            showPhoto={profile.preferences?.showProfilePhoto ?? true}
            averageRating={summary.averageRating}
            reviewCount={summary.reviewCount}
          />

          <section className="space-y-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
            <h2 className="font-headline-md text-headline-md text-primary">Reviews</h2>
            {reviewsLoading && (
              <p className="font-body-md text-body-md text-on-surface-variant">Loading reviews…</p>
            )}
            {reviewsError && (
              <p className="font-body-md text-body-md text-error" role="alert">
                {reviewsError}
              </p>
            )}
            {!reviewsLoading && !reviewsError && reviews.length === 0 && (
              <p className="font-body-md text-body-md text-on-surface-variant">
                No reviews yet.
              </p>
            )}
            {!reviewsLoading && reviews.length > 0 && (
              <div className="space-y-md">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-lg border border-outline-variant bg-surface-container-low p-md"
                  >
                    <div className="mb-sm flex flex-wrap items-center justify-between gap-sm">
                      <Link
                        to={ROUTES.userProfile(review.reviewerId)}
                        className="font-headline-md text-headline-md text-primary hover:underline"
                      >
                        {review.reviewerName}
                      </Link>
                      <span className="font-body-md text-body-md text-on-surface-variant">
                        {formatReviewDate(review.createdAt)}
                      </span>
                    </div>
                    <RatingStars rating={review.rating} className="mb-sm" />
                    {review.comment ? (
                      <p className="font-body-md text-body-md text-on-surface">{review.comment}</p>
                    ) : (
                      <p className="font-body-md text-body-md text-on-surface-variant italic">
                        No written comment.
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-md">
            <h2 className="font-headline-md text-headline-md text-primary">
              Listings by {profile.displayName}
            </h2>
            <ListingsFeed
              listings={profileListings}
              emptyMessage="This user does not have any public listings yet."
            />
          </section>
        </>
      )}
    </Page>
  )
}
