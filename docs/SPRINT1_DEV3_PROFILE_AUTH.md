# Sprint 1 — Dev 3: Profile, Auth & Settings

**Owner:** Developer 3  
**Sprint length:** 2 weeks  
**Related:** [SPRINT1_OVERVIEW.md](./SPRINT1_OVERVIEW.md) · [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md)

---

## 1. Sprint goal

Users have a complete **account and profile experience**: edit profile/settings stored in Firestore, Google login, change password for email users, working follow system, clear wording, and **no dead buttons**.

By sprint end:

- Profile + preferences persist in Firebase and survive refresh.
- Google/Gmail sign-in works.
- Email/password users can change password; Google-only users are not shown a broken flow.
- Follow button works; user can see **who they are following** (not “view followers”).
- Settings section is defined and implemented.
- Avatar strategy works **without Firebase Storage**.

---

## 2. Current status

| Area | Status |
|------|--------|
| Sign up / login / logout | **Done** |
| `userService.ts` | **Done** — `getProfile`, `updateProfile`, `getPreferences`, `updatePreferences` |
| `EditProfilePage.tsx` | **Done** — `/profile/edit` route |
| Profile display + bio | **Done** — from Firestore via auth sync + `getPreferences` for photo toggle |
| Settings page | **Done** — `/settings` (Account, Profile, Preferences, Privacy) |
| User preferences in Firestore | **Done** — flattened on `users/{uid}` |
| `firestore.rules` (users) | **Partial** — basic users rules may exist |
| Google/Gmail login | **Done** — `loginWithGoogle()`, Continue with Google on login/signup |
| Change password | **Not started** |
| Follow button | **UI only** — not wired (`ProfileHeader.tsx`) |
| Following list page | **Not started** |
| Wording / button audit | **Not started** |
| User avatar strategy | **Undecided** — URL + default image today |
| Firebase Storage for photos | **Deferred** — stay free |

---

## 3. Files to inspect first

- [ ] `docs/APP_ARCHITECTURE.md` — profile route, guards, shells
- [ ] `docs/FIREBASE_REFERENCE.md` — `users` schema
- [ ] `src/services/authService.ts` — login, signup, logout, `getCurrentUser()`, `refreshSessionProfile()`
- [ ] `src/context/AuthContext.tsx` — **read only**; add minimal methods only if needed (no second listener)
- [ ] `src/services/userService.ts` — profile read/update
- [ ] `src/types/user.ts` — `AuthUser`, `UserProfile`, `ProfileUpdateInput`
- [ ] `src/pages/ProfilePage.tsx`
- [ ] `src/components/ProfileHeader.tsx` — Message/Follow buttons
- [ ] `src/pages/EditProfilePage.tsx`
- [ ] `src/routes/paths.ts`
- [ ] `src/routes/AppRouter.tsx`
- [ ] `src/layouts/AuthLayout.tsx` — login/signup layout
- [ ] `src/pages/LoginPage.tsx`, `SignupPage.tsx`
- [ ] `firestore.rules` — users (+ follows when added)
- [ ] `src/config/firebaseCollections.ts`

---

## 4. Files this developer owns

| File | Action |
|------|--------|
| `src/services/userService.ts` | Extend profile + preferences + follows |
| `src/services/authService.ts` | Google provider, change password helpers |
| `src/pages/EditProfilePage.tsx` | Finish settings fields |
| `src/pages/ProfilePage.tsx` | Settings links, following entry point |
| `src/pages/SettingsPage.tsx` | **Done** — Account, Profile, Preferences, Privacy |
| `src/pages/FollowingPage.tsx` | **Create** — list of users followed |
| `src/components/ProfileHeader.tsx` | Wire Follow; hide dead Message if needed |
| `src/routes/paths.ts` | `settings`, `following`, etc. |
| `src/routes/AppRouter.tsx` | New routes |
| `src/pages/LoginPage.tsx`, `SignupPage.tsx` | Google button, wording |
| `firestore.rules` | users + follows rules |

**Coordinate (do not own alone):**

- `src/pages/ListingDetailPage.tsx` — only if follow appears there
- Button audit across app — you lead; all devs fix their areas

---

## 5. Files to avoid touching

| File | Why |
|------|-----|
| `src/services/listingService.firestore.ts` | Dev 1 |
| `src/services/messageService*.ts` | Dev 2 |
| `src/context/ListingsContext.tsx` | Dev 1 |
| `src/context/MessagesContext.tsx` | Dev 2 |
| `src/services/listingService.ts` public API | Dev 1 |
| `src/lib/firebase.ts` | Shared — change only with team agreement |
| Firebase Storage setup | Out of scope Sprint 1 |

**AuthContext rule:** Do not rewrite or add a second `onAuthStateChanged`. If profile must refresh after save, use existing `refreshSessionProfile()` / `refreshProfile()` pattern.

---

## 6. Step-by-step task list

### Part A — Finish profile Firebase implementation

- [x] Verify `userService.getProfile(uid)` reads `users/{uid}` from Firestore.
- [x] Verify `userService.updateProfile(uid, patch)` writes `displayName`, `username`, `avatar`, `bio`.
- [x] Ensure `authService` profile sync includes `bio` (preferences loaded via `userService.getPreferences` on Profile/Settings).
- [x] After save on `EditProfilePage`, call `refreshProfile()` and confirm Profile page updates without logout.
- [x] Hard refresh — profile fields still correct (via auth listener + Firestore `users/{uid}`).

### Part B — User preferences

- [x] Store preferences on `users/{uid}` (flattened on same doc as profile).
- [x] Suggested fields:

```ts
{
  preferredListingTypes: ('lending' | 'wanted')[]
  preferredCategories: string[]
  showProfilePhoto: boolean
  showFollowingList: boolean
}
```

- [x] Add `getPreferences(uid)` / `updatePreferences(uid, patch)` in `userService.ts`.
- [x] Settings UI toggles/inputs for each preference.

### Part C — Settings page

- [x] Create `src/pages/SettingsPage.tsx` (dedicated `/settings` route).
- [x] Add route in `paths.ts` and `AppRouter.tsx`.
- [x] Link from Profile page (“Settings” button).
- [x] Sections (see section 7 below).
- [x] Include **Log out** in Account section (reuse existing logout handler).

### Part D — Google / Gmail login

- [X] Enable **Google** provider in Firebase Console → Authentication → Sign-in method.
- [ ] Add authorized domain (localhost + deployment domain when known).
- [x] In `authService.ts`, add `loginWithGoogle()` using `signInWithPopup` or `signInWithRedirect` (popup is easier for local dev).
- [x] On first Google sign-in, create `users/{uid}` doc if missing (`setDoc` merge) with email, displayName, username derived from email, default avatar.
- [x] Add **Continue with Google** button on `LoginPage.tsx` and optionally `SignupPage.tsx`.
- [x] Do **not** add Firebase calls inside page — call `authService` only.

### Part E — Change password (email/password only)

- [ ] Add `changePassword(currentPassword, newPassword)` in `authService.ts` using Firebase `reauthenticateWithCredential` + `updatePassword`.
- [ ] Show change-password form only when `user` signed in with email/password (track `providerId` on session or check `auth.currentUser.providerData`).
- [ ] Hide or disable for Google-only users with message: “Password is managed by Google.”
- [ ] Add UI under Settings → Account.

### Part F — Avatar / photo strategy (no Storage)

**Sprint 1 decision — pick one primary approach:**

| Option | Implementation |
|--------|----------------|
| **Default avatar set** | Static URLs in code; new users get default |
| **Initials avatar** | Component renders circle with initials when no `avatar` URL |
| **External URL** | Keep `avatar` string field on `users/{uid}` (current) |

- [ ] Document team choice in handoff.
- [ ] Do **not** implement Firebase Storage for user photos in Sprint 1.
- [ ] If using initials, create small `Avatar.tsx` component used in ProfileHeader and cards.

### Part G — Follow system

- [ ] Add `followUser(targetUserId)` / `unfollowUser(targetUserId)` in `userService.ts` (or `followService.ts` if you prefer separation).
- [ ] Store following list in Firestore — recommended shape (section 10).
- [ ] Wire **Follow** button on `ProfileHeader.tsx` (and public profile views if any).
- [ ] Toggle Follow / Following state.
- [ ] Prevent following yourself.
- [ ] Create **Following** page — list users the current user follows (avatar, displayName, username, link to profile).
- [ ] **Do not** implement “view followers” in Sprint 1.

### Part H — Wording cleanup

- [ ] Review auth pages: “Sign in”, “Create account”, error messages — plain language.
- [X] Review listing form labels (coordinate Dev 1 if needed).
- [ ] Review messaging empty states (coordinate Dev 2).
- [ ] Replace technical jargon visible to users (“Firestore”, “backend”, etc.).

### Part I — Button audit (team-wide, you lead)

- [ ] List every button on main pages: Dashboard, Listing detail, Profile, Inbox, Settings.
- [ ] For each: **wire**, **hide**, or **disable with explanation**.
- [ ] Known dead buttons to address:

| Location | Button | Sprint 1 action |
|----------|--------|-----------------|
| `ProfileHeader` | Message | Hide until Dev 2 wires, or wire to inbox |
| `ProfileHeader` | Follow | Wire (this sprint) |
| `ListingDetailPage` | Message Owner | Dev 2 |
| Various | Placeholder tabs on Profile | Hide or label “Coming soon” |

- [ ] Share audit checklist with Dev 1 and Dev 2.

### Part J — Security rules

- [ ] Users can read profiles when signed in (adjust for public profile later).
- [ ] Users can write only their own `users/{uid}`.
- [ ] Follow writes: user can only add/remove follows where `followerId == auth.uid`.

---

## 7. Settings section plan

Route: `/settings` (suggested)

| Section | Contents |
|---------|----------|
| **Account** | Email (read-only), change password (email users only), log out |
| **Profile** | Link to Edit Profile — display name, username, bio, avatar URL |
| **Preferences** | Preferred listing types, categories, show profile photo, show following list |
| **Privacy** | Copy explaining what is visible to others; toggles that map to preference fields |

Navigation: Profile tab → **Settings** gear/link → sections above.

---

## 8. User preferences data shape

Store on `users/{uid}` (flattened) **or** `users/{uid}/settings/main`:

```json
{
  "preferredListingTypes": ["lending"],
  "preferredCategories": ["Strategy", "Party"],
  "showProfilePhoto": true,
  "showFollowingList": true
}
```

- [x] Extend `UserProfile` or add `UserPreferences` type in `src/types/user.ts`.
- [x] Map in `userService` read/write.

**Storage choice:** preferences live as top-level fields on `users/{uid}` (same document as profile).

---

## 9. User photo / avatar strategy

**Constraint:** No Firebase Storage in Sprint 1.

**Recommended MVP:**

1. Default avatar image for all new accounts (already in `authService` signup).
2. Optional **avatar URL** on Edit Profile (external hosting).
3. Optional **initials fallback** component when `avatar` is empty or invalid.

- [ ] Team agrees in writing (Slack/doc comment).
- [ ] `showProfilePhoto: false` preference hides avatar on public profile if needed.

---

## 10. Follow system data shape

**Option A — array on user doc (simple, good for Sprint 1):**

`users/{uid}.following: string[]` — array of followed user ids.

**Option B — subcollection (scales better):**

`users/{uid}/following/{targetUid}` → `{ createdAt, targetUsername, targetDisplayName }`

- [ ] Pick one approach; document in handoff.
- [ ] `FollowingPage` reads current user’s following list.
- [ ] **No** `followers` collection or “view followers” page in Sprint 1.

---

## 11. How to test

### Profile & settings

- [ ] Edit display name, username, bio, avatar URL → save → Profile updates.
- [ ] Hard refresh → changes persist.
- [ ] Firebase Console → `users/{uid}` shows fields.
- [ ] Change preferences → persist after refresh.

### Google login

- [ ] New user: Continue with Google → lands in app → `users/{uid}` created.
- [ ] Returning Google user: login works.
- [ ] Google user does not see broken change-password form.

### Change password

- [ ] Email user: change password → can log in with new password.
- [ ] Wrong current password → clear error.

### Follow

- [ ] User A follows User B → button shows Following.
- [ ] User A opens Following list → User B appears.
- [ ] User A unfollows → removed from list.
- [ ] Cannot follow self.

### Button audit

- [ ] Click every visible button on main flows — none fail silently.
- [ ] Hidden buttons are not visible.

### Build

- [ ] `npm run build` passes.

---

## 12. Definition of done

- [x] Profile fields stored in `users/{uid}`; edit page works; refresh persists.
- [x] Preferences stored and editable in Settings.
- [x] Settings page with Account, Profile, Preferences, Privacy sections.
- [x] Google/Gmail login works.
- [ ] Change password works for email/password users only.
- [ ] Avatar strategy implemented without Firebase Storage.
- [ ] Follow button works; following list page exists.
- [ ] **No** view-followers feature.
- [x] Logout available from settings/account.
- [ ] User-friendly wording pass on auth/profile/settings.
- [ ] Dead buttons fixed or hidden (audit complete).
- [ ] No Firebase imports in pages/components (services only).
- [ ] AuthContext not rewritten; no second auth listener.

---

## 13. Handoff notes

Tell the team:

1. Google provider setup steps (Console clicks).
2. Where preferences live in Firestore.
3. Avatar strategy chosen.
4. Follow data model (array vs subcollection).
5. Settings route path.
6. List of buttons hidden vs wired.
7. Firestore rules added for users/follows.
8. Hosting impact on Google authorized domains (coordinate Dev 1).

---

## If confused, check…

- `src/services/userService.ts` — existing profile CRUD
- `src/services/authService.ts` — how signup writes `users/{uid}`
- [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md) — users fields
- [SPRINT1_OVERVIEW.md](./SPRINT1_OVERVIEW.md) — conflict files
- Firebase Console → Authentication → Sign-in method → Google
