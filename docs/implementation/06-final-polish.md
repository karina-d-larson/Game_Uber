# Final polish (wording + buttons)

## Goal

Final review pass: hide dead buttons, remove confusing placeholder UI.

## Current Status

**Complete** — dead Message/Follow removed from ProfileHeader; placeholder tabs removed.

## Files Involved

- `src/components/ProfileHeader.tsx`
- `src/pages/ProfilePage.tsx`

## Step-by-Step Implementation Checklist

- [x] Hide Message button on ProfileHeader (Dev 2 owns wiring)
- [x] Remove or hide non-functional profile tabs (Games Available, About)
- [x] Quick wording scan on auth strings (no “Firestore” in UI)

## Acceptance Criteria

- No dead Message button on own profile
- No tabs that navigate nowhere

## Manual Testing Checklist

- [ ] Profile page click-through — no silent dead actions on Dev 3 surfaces

## Notes

Listing detail CTAs remain Dev 2 responsibility.

## Build result

`npm run build` — **pass** (2026-06-18)
