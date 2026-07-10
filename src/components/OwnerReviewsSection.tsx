import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { RatingStars } from './RatingStars'
import { MaterialIcon } from './MaterialIcon'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../routes/paths'
import { buildLoginRedirect, getReturnPathFromLocation } from '../utils/authRedirect'
import {
  ReviewServiceError,
  createReview,
  fetchReviewsForUser,
  summarizeReviews,
} from '../services/reviewService'
import type { Review } from '../types/review'

type OwnerReviewsSectionProps = {
  ownerId: string
  ownerName: string
  listingId?: string
  isOwner: boolean
}

function formatReviewDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function OwnerReviewsSection({
  ownerId,
  ownerName,
  listingId,
  isOwner,
}: OwnerReviewsSectionProps) {
  const { user } = useAuth()
  const location = useLocation()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const canReview = Boolean(user && !isOwner && user.id !== ownerId)
  const loginTarget = buildLoginRedirect(getReturnPathFromLocation(location))

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchReviewsForUser(ownerId)
        if (!cancelled) setReviews(data)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load reviews.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [ownerId])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canReview) return

    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      const created = await createReview({
        revieweeId: ownerId,
        rating,
        comment: comment.trim() || undefined,
        listingId,
      })
      setReviews((current) => [created, ...current])
      setComment('')
      setRating(5)
      setSubmitSuccess(true)
    } catch (e) {
      setSubmitError(
        e instanceof ReviewServiceError ? e.message : 'Could not submit review.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const summary = summarizeReviews(reviews)

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
      <div className="mb-md flex flex-wrap items-end justify-between gap-sm">
        <h2 className="font-headline-lg text-headline-lg text-primary">
          Reviews for {ownerName}
        </h2>
        {!loading && summary.reviewCount > 0 && summary.averageRating != null && (
          <div className="flex items-center gap-xs">
            <RatingStars rating={summary.averageRating} iconClassName="text-base text-secondary" />
            <span className="font-body-md text-body-md text-on-surface-variant">
              {summary.averageRating} ({summary.reviewCount}{' '}
              {summary.reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}
      </div>

      {loading && (
        <p className="font-body-md text-body-md text-on-surface-variant">Loading reviews…</p>
      )}

      {error && (
        <p className="font-body-md text-body-md text-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && reviews.length === 0 && (
        <p className="font-body-md text-body-md text-on-surface-variant">
          No reviews yet for this user.
        </p>
      )}

      {!loading && reviews.length > 0 && (
        <div className="mb-lg space-y-md">
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
              {review.comment && (
                <p className="font-body-md text-body-md text-on-surface">{review.comment}</p>
              )}
            </article>
          ))}
        </div>
      )}

      {!user && (
        <div className="mt-md rounded-lg border border-outline-variant bg-surface-container-low p-md">
          <p className="mb-sm font-body-md text-body-md text-on-surface-variant">
            Sign in to leave a review.
          </p>
          <Link
            to={loginTarget.pathname}
            state={loginTarget.state}
            className="inline-flex min-h-11 items-center rounded-lg bg-secondary px-lg py-3 font-label-md text-label-md text-on-secondary"
          >
            Sign in
          </Link>
        </div>
      )}

      {canReview && (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-md border-t border-outline-variant pt-md">
          <h3 className="font-headline-md text-headline-md text-primary">Leave a review</h3>
          <div>
            <span className="mb-sm block font-label-md text-label-md text-on-surface-variant">
              Rating
            </span>
            <div className="flex gap-sm">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={[
                    'flex min-h-11 min-w-11 items-center justify-center rounded-lg border transition-colors',
                    rating >= value
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container',
                  ].join(' ')}
                  aria-label={`${value} star${value === 1 ? '' : 's'}`}
                >
                  <MaterialIcon name="star" filled={rating >= value} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="review-comment"
              className="mb-sm block font-label-md text-label-md text-on-surface-variant"
            >
              Comment (optional)
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-outline-variant bg-surface px-md py-sm font-body-md text-body-md text-on-surface"
              placeholder={`Share your experience with ${ownerName}`}
            />
          </div>
          {submitError && (
            <p className="font-body-md text-body-md text-error" role="alert">
              {submitError}
            </p>
          )}
          {submitSuccess && (
            <p className="font-body-md text-body-md text-secondary" role="status">
              Review submitted. Thank you!
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="min-h-11 rounded-lg bg-secondary px-lg py-3 font-label-md text-label-md text-on-secondary disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
        </form>
      )}
    </section>
  )
}
