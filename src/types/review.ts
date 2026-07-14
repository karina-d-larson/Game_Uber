export type Review = {
  id: string
  revieweeId: string
  reviewerId: string
  reviewerName: string
  rating: number
  comment?: string
  listingId?: string
  createdAt: number
}

export type CreateReviewInput = {
  revieweeId: string
  rating: number
  comment?: string
  listingId?: string
}

export type ReviewSummary = {
  averageRating: number | null
  reviewCount: number
}
