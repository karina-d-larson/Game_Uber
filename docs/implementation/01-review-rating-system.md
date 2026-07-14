# Review & Rating System (MVP)

## Goal

Replace hardcoded profile stats and fake reviews with a Firestore-backed review MVP.

## Current Status

- [x] **Complete** — July 2026

## Files Involved

- `src/types/review.ts`
- `src/services/reviewService.ts`
- `src/config/firebaseCollections.ts`
- `src/components/RatingStars.tsx`
- `src/components/OwnerReviewsSection.tsx`
- `src/pages/ProfilePage.tsx`
- `src/pages/PublicProfilePage.tsx`
- `src/components/ProfileHeader.tsx`
- `src/pages/ListingDetailPage.tsx`
- `firestore.rules` (reviews rules added — Dev 1 must deploy)

## Step-by-Step Implementation Checklist

- [x] Add `Review` type and `CreateReviewInput`
- [x] Add `COLLECTIONS.reviews`
- [x] Implement `reviewService.ts` (fetch, create, summarize)
- [x] Add Firestore rules for `reviews` collection
- [x] Update ProfileHeader with real rating/count
- [x] Update ProfilePage — remove mocks, load reviews, empty state
- [x] Add OwnerReviewsSection on listing detail (list + create form)
- [x] Add read-only public profile route with real reviews
- [x] Use deterministic review id for one review per reviewer/reviewee pair
- [x] Link reviewer names to public profiles
- [x] Run `npm run build`

## Acceptance Criteria

- [x] No hardcoded `STATS`, `REVIEWS`, or 4.8 rating
- [x] Real reviews from Firestore on profile and listing detail
- [x] Empty state when no reviews
- [x] Signed-in user can submit 1–5 rating + optional comment
- [x] Average and count match stored data
- [x] `npm run build` passes

## Manual Testing Checklist

- [ ] Profile with no reviews shows empty state (requires Firebase + deployed rules)
- [ ] Submit review from listing detail → appears on profile
- [ ] Average rating updates correctly
- [ ] Cannot review yourself (validation)

## Notes

- Transaction-verified reviews out of scope
- One review per reviewer per reviewee (MVP dedup)
- Review creation uses deterministic doc id: `{reviewerId}_{revieweeId}`
- Firestore rules deploy required for live writes (Dev 1)
