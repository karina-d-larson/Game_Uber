# Final Polish and QA Docs

## Goal

Small UX polish + update stale docs for final demo.

## Current Status

- [x] **Complete** — July 2026

## Files Involved

- `vite.config.ts`
- `src/pages/LoginPage.tsx`, `SignupPage.tsx`
- `src/components/BottomNav.tsx`
- `src/pages/PublicProfilePage.tsx`
- `src/routes/AppRouter.tsx`
- `src/routes/paths.ts`
- `src/layouts/StackShellLayout.tsx`
- `src/index.css`
- `docs/CURRENT_BUGS.md`
- `.env.example`
- `docs/FIREBASE_REFERENCE.md`

## Step-by-Step Implementation Checklist

- [x] PWA name → GameShelf
- [x] Login/signup use ROUTES constants
- [x] Bottom nav active on `/settings`
- [x] Add public `/users/:userId` route
- [x] Fix document scrolling on stack routes
- [x] Link owner/reviewer/following surfaces to public profiles
- [x] Supersede CURRENT_BUGS.md
- [x] Update FIREBASE_REFERENCE for reviews
- [x] Run `npm run build`

## Acceptance Criteria

- [x] Docs reflect current reality
- [x] Build passes
- [x] No unnecessary UI redesign

## Manual Testing Checklist

- [x] PWA manifest name in build output
- [ ] Settings route highlights Profile tab in browser
- [ ] Public profile route scrolls and shows read-only profile

## Notes

Messaging limitations remain Dev 2 scope.
