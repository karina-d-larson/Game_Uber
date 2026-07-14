/**
 * Reviews data layer — Firestore-backed user reviews.
 * UI must call this service, not Firebase directly.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from 'firebase/firestore'

import { COLLECTIONS } from '../config/firebaseCollections'
import { db, isFirebaseConfigured } from '../lib/firebase'
import type { CreateReviewInput, Review, ReviewSummary } from '../types/review'

import { getCurrentUser } from './authService'

export class ReviewServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ReviewServiceError'
  }
}

function requireFirestore() {
  if (!isFirebaseConfigured || !db) {
    throw new ReviewServiceError(
      'Firebase is not configured. Copy .env.example to .env and add your Firebase keys.',
    )
  }
  return db
}

function mapDocToReview(id: string, data: Record<string, unknown>): Review {
  const rating = typeof data.rating === 'number' ? data.rating : 0
  const createdAt =
    typeof data.createdAt === 'number'
      ? data.createdAt
      : data.createdAt &&
          typeof data.createdAt === 'object' &&
          'toMillis' in data.createdAt &&
          typeof (data.createdAt as { toMillis: () => number }).toMillis === 'function'
        ? (data.createdAt as { toMillis: () => number }).toMillis()
        : Date.now()

  return {
    id,
    revieweeId: typeof data.revieweeId === 'string' ? data.revieweeId : '',
    reviewerId: typeof data.reviewerId === 'string' ? data.reviewerId : '',
    reviewerName: typeof data.reviewerName === 'string' ? data.reviewerName : 'User',
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    comment: typeof data.comment === 'string' && data.comment.trim() ? data.comment.trim() : undefined,
    listingId: typeof data.listingId === 'string' ? data.listingId : undefined,
    createdAt,
  }
}

export function summarizeReviews(reviews: Review[]): ReviewSummary {
  if (reviews.length === 0) {
    return { averageRating: null, reviewCount: 0 }
  }

  const sum = reviews.reduce((total, review) => total + review.rating, 0)
  const averageRating = Math.round((sum / reviews.length) * 10) / 10

  return { averageRating, reviewCount: reviews.length }
}

export async function fetchReviewsForUser(revieweeId: string): Promise<Review[]> {
  const firestore = requireFirestore()
  const snapshot = await getDocs(
    query(
      collection(firestore, COLLECTIONS.reviews),
      where('revieweeId', '==', revieweeId),
    ),
  )

  return snapshot.docs
    .map((docSnap) => mapDocToReview(docSnap.id, docSnap.data() as Record<string, unknown>))
    .sort((a, b) => b.createdAt - a.createdAt)
}

export async function fetchReviewSummary(revieweeId: string): Promise<ReviewSummary> {
  const reviews = await fetchReviewsForUser(revieweeId)
  return summarizeReviews(reviews)
}

async function findExistingReview(
  revieweeId: string,
  reviewerId: string,
): Promise<Review | null> {
  const firestore = requireFirestore()
  const docSnap = await getDoc(doc(firestore, COLLECTIONS.reviews, reviewIdForPair(reviewerId, revieweeId)))
  if (!docSnap.exists()) return null

  return mapDocToReview(docSnap.id, docSnap.data() as Record<string, unknown>)
}

function reviewIdForPair(reviewerId: string, revieweeId: string): string {
  return `${reviewerId}_${revieweeId}`
}

export async function createReview(input: CreateReviewInput): Promise<Review> {
  const current = getCurrentUser()
  if (!current) {
    throw new ReviewServiceError('You must be signed in to leave a review.')
  }

  if (current.id === input.revieweeId) {
    throw new ReviewServiceError('You cannot review yourself.')
  }

  const rating = Math.round(input.rating)
  if (rating < 1 || rating > 5) {
    throw new ReviewServiceError('Rating must be between 1 and 5.')
  }

  const existing = await findExistingReview(input.revieweeId, current.id)
  if (existing) {
    throw new ReviewServiceError('You have already reviewed this user.')
  }

  const firestore = requireFirestore()
  const now = Date.now()
  const payload: Record<string, unknown> = {
    revieweeId: input.revieweeId,
    reviewerId: current.id,
    reviewerName: current.displayName || current.username || 'User',
    rating,
    createdAt: now,
  }

  const comment = input.comment?.trim()
  if (comment) payload.comment = comment
  if (input.listingId) payload.listingId = input.listingId

  try {
    const docRef = doc(firestore, COLLECTIONS.reviews, reviewIdForPair(current.id, input.revieweeId))
    await setDoc(docRef, payload)
    return mapDocToReview(docRef.id, payload)
  } catch (err: unknown) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code: string }).code)
        : ''
    if (code === 'permission-denied') {
      throw new ReviewServiceError(
        'Firestore blocked this review. Check security rules for reviews.',
      )
    }
    const message = err instanceof Error ? err.message : 'Could not save review.'
    throw new ReviewServiceError(message)
  }
}
