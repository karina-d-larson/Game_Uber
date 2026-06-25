# Dev 3 Sprint Audit

**Date:** Code-verified audit — updated after implementation pass (2026-06-18).

## Complete

| Feature | Evidence |
|---------|----------|
| Sign up / login / logout | `authService.ts`, `AuthContext.tsx`, auth pages |
| Google login | `loginWithGoogle()`, `GoogleAuthButton`, Firestore profile on first sign-in |
| Profile CRUD | `userService.getProfile` / `updateProfile`, `EditProfilePage` |
| Preferences | `getPreferences` / `updatePreferences`, `SettingsPage` |
| Settings page | `/settings` route, Account + Password + Profile + Preferences |
| Forgot password | `sendPasswordReset()`, LoginPage forgot flow |
| Change password | `changePassword()`, `isEmailPasswordUser()`, SettingsPage |
| Avatar / initials | `Avatar.tsx`, `avatarDisplay.ts`, empty avatar on email signup |
| Follow system | `followUser` / `unfollowUser`, `following` on UserProfile |
| Following page | `/profile/following`, `FollowingPage.tsx` |
| Firestore rules | `firestore.rules` — users + following comments |
| Firebase Hosting config | `firebase.json`, `.firebaserc` |
| Final polish | Dead Message/Follow removed; placeholder tabs removed |

## Remaining (manual / out of scope for code)

| Item | Notes |
|------|-------|
| Firebase Hosting deploy | Requires Console project id + `firebase login` |
| Authorized domains | Console → Authentication after deploy |
| Live password reset | Requires Firebase Auth email template / domain |
| Public profile pages | Follow entry via listing owner card until Dev 3+ |
| Automated tests | None in repo |

## Implementation docs

All six feature docs (`01`–`06`) completed. See each file for manual QA checklists.
