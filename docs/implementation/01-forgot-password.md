# Password flows (forgot + change)

## Goal

Email/password users can reset password from login and change password in Settings. Google-only users see “Password is managed by Google.”

## Current Status

**Complete** — implemented and build verified.

## Files Involved

- `src/services/authService.ts`
- `src/pages/LoginPage.tsx`
- `src/pages/SettingsPage.tsx`

## Step-by-Step Implementation Checklist

- [x] Add `isEmailPasswordUser()` using `auth.currentUser.providerData`
- [x] Add `sendPasswordResetEmail(email)` in authService
- [x] Add `changePassword(currentPassword, newPassword)` with reauth
- [x] LoginPage: forgot password toggle + form
- [x] SettingsPage: change password form OR Google copy
- [x] Export helpers for UI provider check

## Acceptance Criteria

- Forgot password sends Firebase reset email for valid email
- Change password works for email users after reauth
- Google-only users never see broken password forms

## Manual Testing Checklist

- [ ] Forgot password with registered email shows success message
- [ ] Change password with wrong current password shows error
- [ ] Google user sees managed-by-Google message in Settings

## Notes

Pages call `authService` only — no Firebase imports in UI.

## Build result

`npm run build` — **pass** (2026-06-18)
