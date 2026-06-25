# Follow system

## Goal

`users/{uid}.following: string[]`, follow/unfollow, Following page. No followers page.

## Current Status

**Complete** — implemented and build verified.

## Files Involved

- `src/types/user.ts`
- `src/services/userService.ts`
- `src/components/FollowButton.tsx`
- `src/pages/FollowingPage.tsx`
- `src/pages/ProfilePage.tsx`
- `src/pages/ListingDetailPage.tsx` (owner follow — testable entry point)
- `src/routes/paths.ts`, `AppRouter.tsx`

## Step-by-Step Implementation Checklist

- [x] Add follow methods to userService
- [x] Add `following` to UserProfile mapping
- [x] Create FollowButton component
- [x] Hide Follow on own profile; show on listing owner card
- [x] Create FollowingPage with resolved profiles
- [x] Link from ProfilePage when preference enabled
- [x] Prevent self-follow

## Acceptance Criteria

- Follow toggles Firestore `following` array
- Following page lists followed users
- Cannot follow self

## Manual Testing Checklist

- [ ] Follow listing owner from detail page
- [ ] Following page shows followed user
- [ ] Unfollow removes from list

## Notes

Follow button on own profile header removed (dead UI). Entry point is listing owner card until public profiles exist.

## Build result

`npm run build` — **pass** (2026-06-18)
