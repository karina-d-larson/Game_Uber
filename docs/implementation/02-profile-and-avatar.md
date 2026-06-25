# Profile avatar strategy

## Goal

Google users show Google photo; email users show initials; optional external URL on edit. No profile Storage.

## Current Status

**Complete** — implemented and build verified.

## Files Involved

- `src/components/Avatar.tsx`
- `src/utils/avatarDisplay.ts`
- `src/services/authService.ts`
- `src/services/userService.ts`
- `src/components/ProfileHeader.tsx`
- `src/pages/EditProfilePage.tsx`

## Step-by-Step Implementation Checklist

- [x] Create `Avatar` component (image URL or initials circle)
- [x] Email signup stores empty `avatar`
- [x] Google first sign-in stores `photoURL` or empty
- [x] `updateProfile` preserves empty avatar (initials)
- [x] Treat legacy `DEFAULT_AVATAR` as empty for initials
- [x] Use `Avatar` in ProfileHeader and EditProfile preview

## Acceptance Criteria

- Email user without URL sees initials
- Google user sees Google photo when stored
- Custom URL displays when set

## Manual Testing Checklist

- [ ] New email signup shows initials on profile
- [ ] Google login shows photo when available
- [ ] External URL on edit profile displays

## Notes

Google re-login reads existing Firestore profile — custom avatar URL is not overwritten.

## Build result

`npm run build` — **pass** (2026-06-18)
