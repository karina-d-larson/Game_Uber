# Follow UX for Missing Owner Profiles

## Goal

Hide Follow when owner profile does not exist in Firestore.

## Current Status

- [x] **Complete** — July 2026

## Files Involved

- `src/pages/ListingDetailPage.tsx`
- `src/components/FollowButton.tsx`

## Step-by-Step Implementation Checklist

- [x] Only render FollowButton when `ownerProfile` exists
- [x] Add `aria-busy` to FollowButton loading/button states
- [x] Run `npm run build`

## Acceptance Criteria

- [x] No Follow button for missing owners
- [x] Real users still followable
- [x] `npm run build` passes

## Manual Testing Checklist

- [ ] Listing with real owner shows Follow
- [ ] Missing owner profile hides Follow

## Notes

Seed cleanup reduces seed-owner cases in demo.
