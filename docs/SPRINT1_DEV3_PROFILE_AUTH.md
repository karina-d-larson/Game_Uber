# Sprint 1 — Dev 3: Profile, Auth & Settings



**Owner:** Developer 3  

**Sprint length:** 2 weeks  

**App:** GameShelf  

**Related:** [SPRINT1_OVERVIEW.md](./SPRINT1_OVERVIEW.md) · [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md) · **[PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md)** (source of truth for finalized choices)



---



## 1. Sprint goal



Users have a complete **account and profile experience**: edit profile/settings stored in Firestore, Google login, **change password** and **forgot password** for email users, working follow system, clear wording, and **no dead buttons**.



By sprint end:



- Profile + preferences persist in Firebase and survive refresh.

- Google/Gmail sign-in works.

- Email/password users can **change password** (Settings) and use **forgot password** (login); Google-only users see **“Password is managed by Google.”**

- Follow button works; user can see **who they are following** (not “view followers”).

- Settings section is defined and implemented.

- **Avatar strategy** implemented per [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md) — **no Firebase Storage** for profile photos.



**Hosting:** Production deploy target is **Firebase Hosting** (see PRODUCT_DECISIONS.md).



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

| Change password | **Complete** |

| Forgot password | **Complete** |

| Follow button | **Complete** — listing owner card |

| Following list page | **Complete** — `/profile/following` |

| Avatar strategy | **Complete** — `Avatar.tsx`, initials fallback |

| Follow data model | **Complete** — `users/{uid}.following: string[]` |

| Hosting | **Config complete** — deploy requires Console/CLI |

| Wording cleanup | **Mostly done** — final review pass remains |

| Button audit | **Complete** on Dev 3 profile surfaces |

| Firebase Storage for **profile** photos | **Out of scope** — per product decision |



---



## 3. Files to inspect first



- [ ] `docs/PRODUCT_DECISIONS.md` — finalized avatar, follow, hosting, password decisions

- [ ] `docs/APP_ARCHITECTURE.md` — profile route, guards, shells

- [ ] `docs/FIREBASE_REFERENCE.md` — `users` schema

- [ ] `src/services/authService.ts` — login, signup, logout, Google, password helpers (to add)

- [ ] `src/context/AuthContext.tsx` — **read only**; add minimal methods only if needed (no second listener)

- [ ] `src/services/userService.ts` — profile read/update + follows (to extend)

- [ ] `src/types/user.ts` — `AuthUser`, `UserProfile`, `ProfileUpdateInput`

- [ ] `src/pages/ProfilePage.tsx`

- [ ] `src/components/ProfileHeader.tsx` — Follow button

- [ ] `src/pages/EditProfilePage.tsx`

- [ ] `src/pages/LoginPage.tsx` — forgot password entry point

- [ ] `src/routes/paths.ts`, `AppRouter.tsx`

- [ ] `firestore.rules` — users + `following` array writes

- [ ] `firebase.json` — Hosting config (Dev 3 creates)



---



## 4. Files this developer owns



| File | Action |

|------|--------|

| `src/services/userService.ts` | Extend profile + preferences + `following` array |

| `src/services/authService.ts` | Change password, forgot password, provider detection |

| `src/components/Avatar.tsx` | **Create** — Google URL / initials / external URL (per §9) |

| `src/pages/EditProfilePage.tsx` | Avatar display + optional external URL |

| `src/pages/ProfilePage.tsx` | Settings links, following entry point |

| `src/pages/SettingsPage.tsx` | Account: change password (email only) |

| `src/pages/FollowingPage.tsx` | **Create** — list of users followed |

| `src/pages/LoginPage.tsx` | Forgot password link/flow |

| `src/components/ProfileHeader.tsx` | Wire Follow |

| `src/routes/paths.ts`, `AppRouter.tsx` | `settings`, `following`, etc. |

| `firestore.rules` | users + `following` on own doc |

| `firebase.json` | Firebase Hosting + SPA rewrite config |

| `.firebaserc` | Firebase project alias (if using CLI deploy) |



**Coordinate (do not own alone):**



- `src/pages/ListingDetailPage.tsx` — Message Owner (Dev 2)

- Final button review — Dev 3 leads; remaining planned buttons wired by owning dev



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

| Firebase Storage for **profile** photos | **Out of scope** — see PRODUCT_DECISIONS.md |



**AuthContext rule:** Do not rewrite or add a second `onAuthStateChanged`. Use `refreshSessionProfile()` / `refreshProfile()` after profile save.



---



## 6. Step-by-step task list



### Part A — Finish profile Firebase implementation



- [x] Verify `userService.getProfile(uid)` reads `users/{uid}` from Firestore.

- [x] Verify `userService.updateProfile(uid, patch)` writes `displayName`, `username`, `avatar`, `bio`.

- [x] Ensure `authService` profile sync includes `bio`.

- [x] After save on `EditProfilePage`, call `refreshProfile()` and confirm Profile page updates without logout.

- [x] Hard refresh — profile fields still correct.



### Part B — User preferences



- [x] Store preferences on `users/{uid}` (flattened on same doc as profile).

- [x] `getPreferences(uid)` / `updatePreferences(uid, patch)` in `userService.ts`.

- [x] Settings UI toggles/inputs for each preference.



### Part C — Settings page



- [x] Create `src/pages/SettingsPage.tsx` (`/settings`).

- [x] Routes in `paths.ts` and `AppRouter.tsx`.

- [x] Link from Profile page.

- [x] Sections (see §7).

- [x] **Log out** in Account section.



### Part D — Google / Gmail login



- [x] Enable **Google** provider in Firebase Console.

- [x] `loginWithGoogle()` in `authService.ts` (`signInWithPopup`).

- [x] First Google sign-in creates `users/{uid}` if missing (`setDoc` merge).

- [x] **Continue with Google** on `LoginPage.tsx` and `SignupPage.tsx`.

- [x] No Firebase calls inside pages — `authService` / `AuthContext` only.



### Part E — Password / account recovery (email/password only)



**Product decision:** Implement **change password** and **forgot password**. Google-only users do not use these flows.



#### Change password (signed-in, Settings → Account)



- [x] Add `changePassword(currentPassword, newPassword)` in `authService.ts` using `reauthenticateWithCredential` + `updatePassword`.

- [x] Detect email/password provider (`auth.currentUser.providerData` or equivalent).

- [x] Show change-password form **only** for email/password users.

- [x] For Google-only (or Google-linked without password): show **“Password is managed by Google.”** — no broken form.

- [x] Add UI under Settings → Account.



#### Forgot password (signed-out, Login)



- [x] Add `sendPasswordResetEmail(email)` (or wrapper) in `authService.ts`.

- [x] Add **Forgot password?** flow on `LoginPage.tsx` (email field + submit + success/error copy).

- [x] Do not expose forgot-password for Google-only sign-in path (copy should clarify it applies to email accounts).



### Part F — Avatar strategy (decision final — implement)



**Chosen approach** ([PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md)):



| User type | Avatar behavior |

|-----------|-----------------|

| **Google** | Use Google `photoURL` on `users/{uid}.avatar` when available |

| **Email/password** | **Initials** avatar by default when no custom URL |

| **All users** | May set optional **external avatar URL** on Edit Profile |



**Implementation tasks:**



- [x] Create `Avatar.tsx` — image URL if valid; else initials from display name / username.

- [x] Google sign-in / profile sync: persist Google `photoURL` to `avatar` when present (do not overwrite user’s custom URL if they set one later — define merge rule in implementation).

- [x] Email/password signup: leave `avatar` empty or omit so initials render.

- [x] Edit Profile: optional external avatar URL field (already partially present — align with initials fallback).

- [x] Use `Avatar` in `ProfileHeader` and other profile surfaces.

- [x] **Do not** implement Firebase Storage uploads for profile photos.

- [x] Honor `showProfilePhoto: false` preference where applicable.



### Part G — Follow system



**Data model (chosen):** `users/{uid}.following: string[]` — no subcollection, no followers page.



- [x] Add `followUser(targetUserId)` / `unfollowUser(targetUserId)` in `userService.ts`.

- [x] Read/write `following` array on current user’s `users/{uid}` doc only.

- [x] Wire **Follow** on listing owner card (`ListingDetailPage.tsx`); no dead button on own profile header.

- [x] Toggle Follow / Following state.

- [x] Prevent following yourself.

- [x] Create **Following** page — list users the current user follows (avatar, displayName, username).

- [x] **Do not** implement view followers or a followers page.



### Part H — Wording cleanup (final review pass)



Major issues are **mostly fixed** (Offer/Request, listing form, etc.). Remaining:



- [x] Hide dead Message button on own profile (`ProfileHeader.tsx`).

- [x] Remove non-functional profile tabs (Games Available, About).

- [ ] Coordinate messaging empty states with Dev 2 if needed.



### Part I — Button audit (final review pass)



Dead buttons with no planned functionality are **mostly removed/hidden**. Remaining planned buttons are **owned by teammates**:



| Location | Button | Owner |

|----------|--------|-------|

| `ListingDetailPage` | Message Owner / Message requester | Dev 2 |

| `ProfileHeader` | Message | Dev 2 |

| `ProfileHeader` | Follow | **Dev 3** (this sprint) |



- [ ] Dev 3: final click-through on profile, settings, auth — no silent failures.

- [ ] Confirm no resurrected dead buttons on main flows before sprint sign-off.



### Part J — Security rules



- [x] Users can read profiles when signed in (adjust for public profiles later).

- [x] Users can write only their own `users/{uid}`.

- [x] `following` array: only `auth.uid` can update their own doc’s `following` field.



### Part K — Firebase Hosting (Dev 3 implements)



Production host is **Firebase Hosting** ([PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md)). Dev 3 owns setup and deploy — not Dev 1 or Dev 2.



- [x] Add `firebase.json` with SPA rewrite rules (`**` → `/index.html`).

- [x] Confirm production build: `npm run build` → deploy `dist/`.

- [ ] Deploy to Firebase Hosting (`firebase deploy --only hosting` or CI).

- [ ] Add **Authorized domains** in Firebase Console → Authentication:

  - `localhost` (local dev)

  - Production Hosting domain (e.g. `*.web.app`, `*.firebaseapp.com`, custom domain if used)

- [ ] Verify **Google sign-in** works on deployed URL.

- [ ] Verify **forgot-password** reset links work with deployed auth domain.

- [ ] Share deployed URL with team for integration testing (listings, messaging).



---



## 7. Settings section plan



Route: `/settings`



| Section | Contents |

|---------|----------|

| **Account** | Email (read-only), **change password** (email/password users only), Google copy for password-managed-by-Google, log out |

| **Profile** | Link to Edit Profile — display name, username, bio, optional external avatar URL |

| **Preferences** | Preferred listing types, categories, show profile photo, show following list |

| **Privacy** | What is visible to others; toggles tied to preference fields |



**Login page (not Settings):** **Forgot password?** for email/password account recovery.



---



## 8. User preferences data shape



Stored as top-level fields on `users/{uid}` (same document as profile):



```json

{

  "preferredListingTypes": ["lending", "wanted"],

  "preferredCategories": ["Strategy", "Party"],

  "showProfilePhoto": true,

  "showFollowingList": true

}

```



- [x] `UserPreferences` type in `src/types/user.ts`.

- [x] Map in `userService` read/write.



---



## 9. Avatar strategy (final)



See [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md) § Profile / avatar strategy.



**Summary:**



1. **Google users** — Google profile photo when available (`photoURL` → `avatar`).

2. **Email/password users** — **initials** avatar by default.

3. **Optional** external avatar URL on Edit Profile for any user.

4. **No** Firebase Storage for profile photos.

5. `showProfilePhoto: false` may hide avatar on public profile.



**Implementation:** [ ] not complete until `Avatar.tsx` and provider-specific defaults are wired (§6 Part F).



---



## 10. Follow system data shape (final)



**Chosen:** array on user document.



```text

users/{uid}.following: string[]

```



- Each entry is a followed user’s `uid`.

- `FollowingPage` loads current user’s `following` array and resolves display fields from `users/{targetUid}` (or cached denormalized data if added later).

- **No** followers collection, **no** view-followers page, **no** followers UI in Sprint 1.



**Not chosen:** subcollection `users/{uid}/following/{targetUid}` (may revisit at scale).



---



## 11. How to test



### Profile & settings



- [ ] Edit display name, username, bio, external avatar URL → save → Profile updates.

- [ ] Hard refresh → changes persist.

- [ ] Google user shows Google photo (or initials/URL per rules).

- [ ] Email user without URL shows initials.

- [ ] Change preferences → persist after refresh.



### Google login



- [ ] New user: Continue with Google → `users/{uid}` created with Google photo when available.

- [ ] Returning Google user: login works.

- [ ] Google user sees **“Password is managed by Google.”** in Settings — not a change-password form.



### Change password



- [ ] Email user: change password in Settings → can sign in with new password.

- [ ] Wrong current password → clear error.



### Forgot password



- [ ] Login → Forgot password → email sent (check inbox or Firebase Console).

- [ ] Reset link works for email/password account.



### Follow



- [ ] User A follows User B → button shows Following.

- [ ] User A opens Following list → User B appears.

- [ ] User A unfollows → removed from list.

- [ ] Cannot follow self.

- [ ] No view-followers page exists.



### Final review



- [ ] Wording pass on auth/profile/settings complete.

- [ ] Button click-through — no silent failures on Dev 3 surfaces.



### Firebase Hosting



- [ ] Deployed build loads on Firebase Hosting URL.

- [ ] Google login works on production domain.

- [ ] Password reset email links resolve correctly.



### Build



- [ ] `npm run build` passes.



---



## 12. Definition of done



- [x] Profile fields stored in `users/{uid}`; edit page works; refresh persists.

- [x] Preferences stored and editable in Settings.

- [x] Settings page with Account, Profile, Preferences, Privacy sections.

- [x] Google/Gmail login works.

- [ ] Change password works for **email/password users only**.

- [ ] Forgot password works for **email/password users**.

- [ ] Google-only users see **“Password is managed by Google.”** — no broken password UI.

- [ ] Avatar strategy **implemented** (Google photo, initials, optional URL — no profile Storage).

- [ ] Follow button works; **Following** page exists.

- [ ] **No** view-followers feature.

- [x] Logout available from settings/account.

- [ ] Final wording review pass complete.

- [ ] Final button review pass complete.

- [ ] **Firebase Hosting** configured and deployed (or documented blocker).

- [ ] Auth **authorized domains** include localhost + Hosting URL.

- [ ] No Firebase imports in pages/components (services only).

- [ ] AuthContext not rewritten; no second auth listener.



---



## 13. Handoff notes



Tell the team:



1. **Product decisions:** [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md)

2. **Firebase Hosting** URL + **authorized domains** for Google and password reset.

3. Preferences live on `users/{uid}`.

4. **Avatar:** Google photo / initials / external URL — no profile Storage.

5. **Follow model:** `users/{uid}.following: string[]`.

6. **Password:** change (Settings, email only) + forgot (Login).

7. Settings route: `/settings`; Following route: TBD in `paths.ts`.

8. Firestore rules for users + `following`.



---



## If confused, check…



- [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md) — finalized choices

- `src/services/userService.ts` — profile CRUD

- `src/services/authService.ts` — auth + Google

- [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md) — users fields

- [SPRINT1_OVERVIEW.md](./SPRINT1_OVERVIEW.md) — conflict files

- Firebase Console → Authentication → Sign-in method → Google


