# Final Project — Dev 3: Auth, Profile & App Flow

**Owner:** Developer 3  
**Period:** Final two-week development sprint (post–Sprint 1)  
**App:** GameShelf  
**Sources:** [QA_AUDIT_FINAL.md](./QA_AUDIT_FINAL.md) · [FINAL_WORKING_APP_BACKLOG.md](./FINAL_WORKING_APP_BACKLOG.md) · [APP_ARCHITECTURE.md](./APP_ARCHITECTURE.md)

Dev 3 owns **guest browsing, login-required actions, search improvements, listing detail UX, mock content cleanup, final UX polish, final QA, and deployment verification**. Dev 3 does **not** own Firestore/Storage listing rules, listing CRUD internals, or messaging service internals.

---

# Current Status

## Authentication & profile — largely complete

| Area | Status | Evidence |
|------|--------|----------|
| Email/password signup & login | **Complete** | `authService.ts`, `LoginPage`, `SignupPage` |
| Google Sign In | **Complete** | `loginWithGoogle()`, `GoogleAuthButton`, Firestore profile on first login |
| Session management | **Complete** | Single `subscribeToAuthChanges`; `AuthGate` splash |
| Forgot password | **Complete** | `sendPasswordReset()` + Login UI |
| Change password | **Complete** | Settings form for email users; Google copy for others |
| Profile edit | **Complete** | `EditProfilePage`, `userService.updateProfile()` |
| Settings & preferences | **Complete** | `SettingsPage`, visibility toggles, listing type prefs |
| Avatar system | **Complete** | `Avatar.tsx`, Google photo / initials / URL |
| Follow system | **Complete** | `FollowButton`, `FollowingPage`, Firestore `following[]` |
| Firestore users rules (in repo) | **Partial** | Valid inner block; orphan outer block needs Dev 1 cleanup (QA-002) |
| `firebase.json` / `.firebaserc` | **Complete** | Hosting + rules references |
| Firebase Hosting deploy | **Complete** | Team confirmed deploy + authorized domain |
| `.env.example` | **Complete** | Firebase keys + `VITE_LISTINGS_BACKEND` |

## App flow & UX — final-project work largely complete

| Area | Status | Evidence |
|------|--------|----------|
| Guest browsing — public feed | **Complete** | `/` public in `AppRouter.tsx` |
| Guest browsing — listing detail | **Complete** | `/listings/:id` public |
| Protected routes | **Complete** | Create, inbox, profile, settings, edit, chat behind `ProtectedRoute` |
| Login-required actions | **Complete** | `useRequireAuth()`, `buildLoginRedirect()`, `BottomNav` auth tabs |
| Post-login return path | **Complete** | `getPostAuthPath()`, `getReturnPathFromLocation()` |
| Search partial/close match | **Complete** | `listingSearch.ts` + `listingFilters.ts` |
| Search + filter AND logic | **Complete** | Purpose, category, exchange optional except purpose toggle |
| Filter-aware empty state | **Complete** | “No listings match your search…” on `DashboardPage` |
| Listing detail layout polish | **Complete** | Side-by-side md+ grid; capped image height; requests skip image column |
| Listing detail mock reviews | **Complete** | Removed fake review section |
| Follow hidden for guests | **Complete** | `FollowButton` only when `user` on listing detail |
| “View full profile” dead link | **Complete** | Removed from listing detail (QA-101) |

## Remaining gaps (Dev 3 scope)

| Area | Status | QA ref |
|------|--------|--------|
| Profile mock stats & reviews | **Not done** | QA-103 — `ProfilePage.tsx` `STATS`, `REVIEWS`; `ProfileHeader.tsx` hardcoded 4.8 rating |
| Follow on seed listing owners | **Not done** | QA-102 — `ownerId: 'seed-owner-*'` has no Firestore user doc |
| Analytics init without `.env` | **Not done** | QA-006 — `getAnalytics(app)` when `app` undefined |
| Signup Firestore write consistency | **Not done** | QA-007 — signup uses `doc(db, ...)` not `requireFirestoreDb()` |
| Signed-in listing CTAs | **Dev 2** | QA-001 — guests redirect; signed-in no-op until Dev 2 wires messaging |
| Stale `CURRENT_BUGS.md` | **Not done** | QA-108 |
| Minor polish (ROUTES in auth pages, PWA name, a11y) | **Partial** | QA-201–QA-208 |

---

# Remaining Critical Tasks

## D3-C1 — Remove or label mock profile content (QA-103)

**Problem:** Profile shows hardcoded lender scores, review cards, and 4.8 rating as if real.

**Work:**
- **Preferred:** Hide `STATS`, `REVIEWS`, and hardcoded rating until features exist.
- **Alternative:** Label sections “Sample data” with clear non-production styling.
- Do not add fake Firestore documents for reviews.

**Files:** `ProfilePage.tsx`, `ProfileHeader.tsx`

---

## D3-C2 — Guard Firebase Analytics init (QA-006)

**Problem:** `export const analytics = getAnalytics(app)` runs when `app` may be `undefined` (missing `.env`).

**Work:**
- Only call `getAnalytics` when `app` is defined.
- Export `analytics` as optional or lazy-init.
- Verify fresh clone without `.env` loads app (dev warning only, no white screen).

**Files:** `src/lib/firebase.ts`

---

## D3-C3 — Signup Firestore write hardening (QA-007)

**Problem:** Signup path uses `setDoc(doc(db, ...))` directly instead of `requireFirestoreDb()`.

**Work:**
- Use same guard pattern as other auth/profile writes.
- Clear error if Firestore unavailable after Auth user created.

**Files:** `src/services/authService.ts`

---

## D3-C4 — Final QA pass & deployment verification (QA-109)

**Problem:** QA audit predates several Dev 3 fixes; evaluators need current truth.

**Work:**
- Run [E2E_TEST_PLAN.md](./E2E_TEST_PLAN.md) guest browse + auth return paths.
- Smoke-test **deployed** Hosting URL: SPA routes, Google login, password reset domain.
- Update or supersede `CURRENT_BUGS.md` with pointers to `QA_AUDIT_FINAL.md` + this doc.
- Confirm authorized domains in Firebase Console for production URL.

**Files:** `docs/CURRENT_BUGS.md` (update), team demo script

---

## D3-C5 — Coordinate guest Firestore read with Dev 1 (D1-C2)

**Problem:** Guest routes work in app, but Firestore may deny unauthenticated listing reads until rules updated.

**Work:**
- Verify logged-out browser loads feed when `VITE_LISTINGS_BACKEND=firestore`.
- If permission-denied, flag Dev 1 immediately — not a routing fix.
- Document demo requirement: rules must allow public listing read.

**Owner:** Dev 3 verifies; Dev 1 implements rules.

---

# Remaining Major Tasks

## D3-M1 — Follow UX for missing owner profiles (QA-102)

- Hide `FollowButton` when `getProfile(ownerId)` returns null (seed listings).
- Or show disabled state: “Owner profile unavailable.”
- Avoid raw “User not found.” in UI during demos.

**Files:** `FollowButton.tsx` and/or `ListingDetailPage.tsx` (display logic only — not `userService` internals unless minimal)

---

## D3-M2 — Final UX polish

| Item | QA | Action |
|------|-----|--------|
| PWA manifest name “Game Uber” | QA-201 | Rename to GameShelf in `vite.config.ts` |
| Hardcoded auth links | QA-202 | Use `ROUTES.login` / `ROUTES.signup` in Login/Signup pages |
| Bottom nav Profile active on sub-routes | QA-203 | Already uses `pathname.startsWith('/profile')` — verify `/settings` behavior |
| FollowButton loading a11y | QA-207 | `aria-busy` or live region |
| Auth error message mapping | QA-208 | Generic fallback for unknown Firebase codes |

---

## D3-M3 — Dead UI audit (QA-001, QA-009)

- Walk all pages; confirm no button without handler or explicit disabled+reason.
- Listing detail CTAs: document as **Dev 2** until wired; guests already redirect correctly.
- Profile: no revived dead Message/Follow buttons on own profile.

---

## D3-M4 — Documentation refresh (QA-108)

- Update `FINAL_PROJECT_SUMMARY.md` status table if presenting to instructors.
- Ensure `APP_ARCHITECTURE.md` reflects public vs protected routes.
- Cross-link [FINAL_WORKING_APP_BACKLOG.md](./FINAL_WORKING_APP_BACKLOG.md).

---

## D3-M5 — Demo script & evaluator notes

- Document: use real-user listings for Follow demo (not seed owners).
- Document: messaging scope per Dev 2 decision.
- Document: `VITE_LISTINGS_BACKEND=firestore` for cross-account listing demo.

---

# Out of Scope

| Item | Owner / notes |
|------|----------------|
| Firestore rules structure fix | Dev 1 — QA-002 |
| Listings + Storage rules | Dev 1 — QA-003, QA-004 |
| Listing Firestore CRUD changes | Dev 1 — unless bug blocking guest read verification |
| `messageService.dev.ts` / Firestore messaging | Dev 2 |
| Wire Message Owner for signed-in users | Dev 2 — D2-C2 |
| Conversation deduplication | Dev 2 |
| Public profile routes (`/users/:id`) | Future version |
| Real reviews/ratings system | Future — hide mocks instead |
| Followers page | Out of product scope |
| Profile photo Storage upload | Product decision: URLs/initials/Google only |
| Automated Playwright/Cypress suite | Post-submit |
| Rewrite app architecture or second auth listener | Forbidden |

---

# Testing Checklist

## Guest browsing

- [ ] Incognito: `/` loads dashboard without login redirect
- [ ] Incognito: open listing from feed → detail loads
- [ ] Incognito: search and category filters work
- [ ] Incognito: tap **Create** / **Inbox** / **Profile** in bottom nav → `/login` with return path
- [ ] Incognito: **Message Owner** on listing → login → returns to listing after sign-in
- [ ] Signed-in user: all routes work as before

## Search (regression)

- [ ] Search `cat` finds listing titled **Catan** (partial match)
- [ ] Search by category label narrows results
- [ ] Search + category filter + Offers/Requests toggle combine (AND)
- [ ] No matches → “No listings match your search. Try changing your search or filters.”

## Listing detail layout (regression)

- [ ] Offer with image: balanced side-by-side on tablet/desktop; image not full viewport
- [ ] Offer without image: placeholder, no broken layout
- [ ] Request listing: no empty image column
- [ ] No mock review section visible
- [ ] Owner manage actions still work for owner

## Auth & profile

- [ ] Email signup → profile in Firestore
- [ ] Google login → photo on profile when available
- [ ] Forgot password email sends (deployed domain)
- [ ] Change password (email user) in Settings
- [ ] Edit profile persists after refresh
- [ ] Follow real user from listing → appears on Following page

## Mock content cleanup (after D3-C1)

- [ ] Profile shows no fake stats/reviews as real data
- [ ] No hardcoded 4.8 rating unless labeled sample

## Firebase resilience (after D3-C2, D3-C3)

- [ ] App loads without `.env` in dev — warning only, no crash
- [ ] Signup with valid Firebase config creates Auth + Firestore user doc

## Deployment (D3-C4)

- [ ] Deployed URL: `/`, `/listings/:id`, `/login` load
- [ ] Deep link refresh works (SPA rewrite)
- [ ] Google sign-in on deployed domain
- [ ] `npm run build` passes

## Firestore guest read (with Dev 1)

- [ ] Logged-out + `firestore` backend: feed and detail load (not permission-denied)

---

# Definition of Done

Dev 3’s final-project work is **done** when:

1. **Guest browsing** works end-to-end: public feed and detail; login only for create, message, follow, profile, settings, owner actions; return URL after login.
2. **Search and listing detail UX** remain stable (no regressions from final-project polish).
3. **Mock profile content** is hidden or clearly labeled — no misleading stats/reviews/ratings.
4. **Firebase init** does not crash without `.env`; signup uses consistent Firestore guards.
5. **Follow UX** does not show confusing errors on seed listings (hidden or graceful message).
6. **Deployed site** smoke-tested; authorized domains confirmed; demo script updated.
7. **Final QA** completed per checklist; bug doc refreshed or superseded.
8. **`npm run build` passes**; no changes to messaging service internals or listing CRUD unless coordinated bugfix.

---

## Key files (reference)

| File | Role |
|------|------|
| `src/routes/AppRouter.tsx` | Public vs protected routes |
| `src/routes/guards.tsx` | AuthGate, ProtectedRoute, GuestRoute |
| `src/hooks/useRequireAuth.ts` | Guest → login with return path |
| `src/utils/authRedirect.ts` | `buildLoginRedirect`, `getPostAuthPath` |
| `src/components/BottomNav.tsx` | Guest tab redirects |
| `src/utils/listingSearch.ts` | Partial/close search |
| `src/utils/listingFilters.ts` | Filter + search AND logic |
| `src/pages/DashboardPage.tsx` | Feed, empty states |
| `src/pages/ListingDetailPage.tsx` | Layout polish; CTA shell for Dev 2 |
| `src/pages/ProfilePage.tsx` | **Mock cleanup target** |
| `src/components/ProfileHeader.tsx` | **Mock rating target** |
| `src/lib/firebase.ts` | **Analytics guard target** |
| `src/services/authService.ts` | **Signup hardening target** |
| `firebase.json`, `.firebaserc` | Hosting deploy |

---

## Completed final-project deliverables (do not redo)

- Public routes for home + listing detail
- `useRequireAuth` + BottomNav login redirects
- `listingSearch.ts` partial matching
- Listing detail side-by-side layout + mock review removal
- Filter-aware dashboard empty state

---

*Last updated: June 2026 — regenerated from QA audit and current codebase. Supersedes Sprint 1 Dev 3 checklist items already shipped (Google auth, follow, password flows, avatar, etc.).*
