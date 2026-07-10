import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { ProfileHeader } from '../components/ProfileHeader'
import { RatingStars } from '../components/RatingStars'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../routes/paths'
import { fetchReviewsForUser, summarizeReviews } from '../services/reviewService'
import { getPreferences } from '../services/userService'
import type { Review } from '../types/review'
import { DEFAULT_USER_PREFERENCES } from '../types/user'

function formatReviewDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ProfilePage() {
  const { user } = useAuth()
  const [showPhoto, setShowPhoto] = useState(DEFAULT_USER_PREFERENCES.showProfilePhoto)
  const [showFollowingList, setShowFollowingList] = useState(
    DEFAULT_USER_PREFERENCES.showFollowingList,
  )
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    let cancelled = false
    void (async () => {
      try {
        const prefs = await getPreferences(user.id)
        if (!cancelled) {
          setShowPhoto(prefs.showProfilePhoto)
          setShowFollowingList(prefs.showFollowingList)
        }
      } catch {
        if (!cancelled) {
          setShowPhoto(DEFAULT_USER_PREFERENCES.showProfilePhoto)
          setShowFollowingList(DEFAULT_USER_PREFERENCES.showFollowingList)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  useEffect(() => {
    if (!user) return

    let cancelled = false
    void (async () => {
      setReviewsLoading(true)
      setReviewsError(null)
      try {
        const data = await fetchReviewsForUser(user.id)
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
  }, [user?.id])

  if (!user) return null

  const summary = summarizeReviews(reviews)

  return (
    <Page header={<PageHeader variant="profile" />} className="space-y-xl">
      <ProfileHeader
        user={user}
        showPhoto={showPhoto}
        averageRating={summary.averageRating}
        reviewCount={summary.reviewCount}
      />

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg custom-shadow">
        <h3 className="mb-md font-headline-md text-headline-md text-primary">Account</h3>
        <p className="mb-md font-body-md text-body-md text-on-surface-variant">
          Signed in as {user.email}
        </p>
        <div className="flex flex-wrap gap-md">
          <Link
            to={ROUTES.settings}
            className="inline-flex min-h-11 items-center rounded-lg bg-secondary px-lg py-3 font-label-md text-label-md text-on-secondary transition-colors hover:brightness-110"
          >
            Settings
          </Link>
          {showFollowingList && (
            <Link
              to={ROUTES.following}
              className="inline-flex min-h-11 items-center rounded-lg border border-outline-variant px-lg py-3 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
            >
              Following
            </Link>
          )}
        </div>
      </section>

      <section className="space-y-lg">
        <h3 className="font-headline-md text-headline-md text-primary">Reviews</h3>

        {reviewsLoading && (
          <p className="font-body-md text-body-md text-on-surface-variant">Loading reviews…</p>
        )}

        {reviewsError && (
          <p className="font-body-md text-body-md text-error" role="alert">
            {reviewsError}
          </p>
        )}

        {!reviewsLoading && !reviewsError && reviews.length === 0 && (
          <p className="rounded-xl bg-surface-container-low p-lg font-body-md text-body-md text-on-surface-variant">
            No reviews yet. Reviews from other users will appear here after they rate you on a
            listing.
          </p>
        )}

        {!reviewsLoading && reviews.length > 0 && (
          <div className="space-y-md">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="flex flex-col gap-lg rounded-xl bg-surface-container-lowest p-lg custom-shadow md:flex-row"
              >
                <div className="flex shrink-0 flex-col md:items-start">
                  <Link
                    to={ROUTES.userProfile(review.reviewerId)}
                    className="font-label-md text-label-md text-on-surface hover:underline"
                  >
                    {review.reviewerName}
                  </Link>
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    {formatReviewDate(review.createdAt)}
                  </span>
                </div>
                <div className="flex-1 space-y-xs">
                  <RatingStars rating={review.rating} />
                  {review.comment ? (
                    <p className="font-body-md text-body-md text-on-surface">{review.comment}</p>
                  ) : (
                    <p className="font-body-md text-body-md text-on-surface-variant italic">
                      No written comment.
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Page>
  )
}
