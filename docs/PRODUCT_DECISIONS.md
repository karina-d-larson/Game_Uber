# GameShelf — Product decisions

**Purpose:** Single source of truth for finalized product and architecture choices.  
**When docs conflict:** prefer this file, then update the sprint doc to match.

**Related:** [SPRINT1_OVERVIEW.md](./SPRINT1_OVERVIEW.md) · sprint docs per developer · [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md) (schemas)

---

## App identity

- **Product name:** GameShelf
- **What it is:** A board game lending, renting, and trading community app (React + TypeScript + Tailwind + Firebase).
- **Listings model:** **Offer** vs **Request** (`listingPurpose: "offer" | "request"`), not “lending/wanted” as primary user-facing language.

---

## Authentication

- **Email/password:** Sign up, sign in, sign out via Firebase Auth.
- **Google:** Continue with Google on login and signup; first sign-in creates `users/{uid}` if missing.
- **Session:** Single auth listener via `authService.subscribeToAuthChanges` — do not add a second listener in UI.

---

## Profile / avatar strategy

**Decision (final):** No Firebase Storage for profile photos.

| User type | Default avatar | Override |
|-----------|----------------|----------|
| **Google sign-in** | Google `photoURL` when available | Optional external avatar URL on Edit Profile |
| **Email/password** | **Initials** avatar (derived from display name / username) | Optional external avatar URL on Edit Profile |

**Rules:**

- Store avatar as a string URL on `users/{uid}.avatar` (Google photo URL, user-pasted external URL, or empty for initials fallback).
- Do **not** upload profile images to Firebase Storage.
- Implement a shared `Avatar` component: show image when `avatar` URL is valid; otherwise render initials for email users.
- `showProfilePhoto` preference may hide avatar on public profile views.

**Listing photos** are separate — see [SPRINT1_DEV1_FIREBASE_LISTINGS.md](./SPRINT1_DEV1_FIREBASE_LISTINGS.md) (Firebase Storage for optional **offer** listing images only).

---

## Settings

- **Route:** `/settings`
- **Sections:** Account, Profile (link to edit), Preferences, Privacy
- **Account:** read-only email, password/account recovery (email users only), log out
- **Profile edit:** display name, username, bio, optional external avatar URL
- **Preferences:** preferred listing types, categories, show profile photo, show following list (stored on `users/{uid}`)

---

## Follow system

**Decision (final):** Simple array on the user document.

```text
users/{uid}.following: string[]   // array of followed user uids
```

**In scope:**

- Follow / unfollow another user
- Toggle Follow / Following on profile
- **Following page** — current user can see who they follow (display name, username, avatar, link to profile)
- Prevent following yourself

**Out of scope:**

- Followers page
- View followers
- Followers collection or subcollection model (unless team revisits at scale)

---

## Hosting

**Decision (final):** **Firebase Hosting** for the GameShelf web app.

**Implications:**

- Add production domain to Firebase **Authorized domains** for Auth (Google sign-in, password reset links).
- **Dev 3** implements Firebase Hosting setup and deploy (see [SPRINT1_DEV3_PROFILE_AUTH.md](./SPRINT1_DEV3_PROFILE_AUTH.md)).

**Not chosen:** GitHub Pages, Vercel (unless used temporarily for previews — production target is Firebase Hosting).

---

## Password / account recovery

**Decision (final):** Implement **both** flows for email/password users.

### Change password (signed-in, Settings → Account)

- Only for users who signed in with **email/password** (`password` provider).
- Use Firebase `reauthenticateWithCredential` + `updatePassword`.
- **Google-only users** do not get the form — show copy: **“Password is managed by Google.”**

### Forgot password (signed-out)

- Available on login flow for email/password users.
- Use Firebase `sendPasswordResetEmail`.
- User receives email link; no change-password UI for Google-only accounts.

**Not in scope:** Linking Google and email accounts into one login method (unless added later).

---

## Button behavior

**Decision (final):**

- Dead buttons with **no planned functionality** have been **mostly removed or hidden** already.
- **Remaining planned buttons** are owned by the appropriate teammate and wired in their sprint area (e.g. Message Owner → Dev 2, Follow → Dev 3).
- **Final review pass** only — Dev 3 leads a last click-through before sprint sign-off; no large new audit unless regressions appear.

| Area | Owner | Examples |
|------|-------|----------|
| Listings / feed | Dev 1 | Listing CRUD, images |
| Messaging | Dev 2 | Message Owner, inbox, chat |
| Profile / auth / follow / **hosting** | Dev 3 | Follow, settings, password, Firebase Hosting |

---

## Wording cleanup

**Decision (final):**

- Major wording issues (Offer/Request, listing labels, auth copy) have been **mostly fixed**.
- Keep a **final review pass** open for auth, profile, settings, and any remaining user-visible jargon (“Firestore”, “backend”, legacy lending/wanted labels).
- Listing copy is coordinated with Dev 1 when needed.

---

## Out-of-scope items

| Item | Notes |
|------|--------|
| Firebase Storage for **profile** photos | Use URLs + initials / Google photo only |
| View followers / followers page | Following list only |
| Firebase Storage for **request** listing images | Requests never have photos |
| Rewriting `AuthContext` or second auth listener | Use existing session pattern |
| Account linking (Google + email same user) | Not Sprint 1 unless explicitly added |
| Real-time Firestore listeners everywhere | Fetch on load default; listeners optional stretch |

---

## Document index

| Topic | Task list |
|-------|-----------|
| Listings + listing photos | [SPRINT1_DEV1_FIREBASE_LISTINGS.md](./SPRINT1_DEV1_FIREBASE_LISTINGS.md) |
| Messaging | [SPRINT1_DEV2_MESSAGING.md](./SPRINT1_DEV2_MESSAGING.md) |
| Profile, auth, follow, password, **hosting** | [SPRINT1_DEV3_PROFILE_AUTH.md](./SPRINT1_DEV3_PROFILE_AUTH.md) |
| Schemas + env | [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md) |
