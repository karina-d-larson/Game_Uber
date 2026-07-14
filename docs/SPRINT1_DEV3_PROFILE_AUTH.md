# Final Project — Dev 3: Auth, Profile & App Flow

**Owner:** Developer 3  
**Period:** Final two-week development sprint (post–Sprint 1)  
**App:** GameShelf  
**Sources:** [QA_AUDIT_FINAL.md](./QA_AUDIT_FINAL.md) · [FINAL_WORKING_APP_BACKLOG.md](./FINAL_WORKING_APP_BACKLOG.md) · [APP_ARCHITECTURE.md](./APP_ARCHITECTURE.md)

Dev 3 owns **guest browsing, login-required actions, search improvements, listing detail UX, reviews/ratings MVP, seed data cleanup for demo, final UX polish, final QA, and deployment verification**. Dev 3 does **not** own Firestore/Storage listing rules, listing CRUD internals, or messaging service internals.

**Product decisions (July 2026):**
- **Reviews:** Build a real Firestore-backed review/rating MVP — not fake stats or hidden placeholders.
- **Analytics:** Firebase Analytics is **not needed** — remove/disable safely.
- **Seed data:** May be cleared from production/demo paths if local dev fallback still works.

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
| Listing detail mock reviews | **Complete** | Removed fake review section (real reviews to be added via D3-C1) |
| Follow hidden for guests | **Complete** | `FollowButton` only when `user` on listing detail |
| Public user profiles | **Complete** | `/users/:userId` read-only profile route |
| “View full profile” owner link | **Complete** | Listing detail owner card links to `/users/:userId` |

## Remaining gaps (Dev 3 scope)

| Area | Status | QA ref |
|------|--------|--------|
| Real review/rating system | **Complete** | `reviewService.ts`, ProfilePage, ProfileHeader, OwnerReviewsSection |
| Firebase Analytics removal | **Complete** | Analytics removed from `firebase.ts` |
| Seed data in demo/production paths | **Complete** | `VITE_DEV_SEED_DATA` gate; default off |
| Signup Firestore write consistency | **Complete** | `requireFirestoreDb()` in signup |
| Follow on seed listing owners | **Complete** | Follow hidden when `ownerProfile` missing |
| Signed-in listing CTAs | **Dev 2** | QA-001 — guests redirect; signed-in no-op until Dev 2 wires messaging |
| Final UX polish | **Complete** | PWA name, ROUTES, bottom nav, FollowButton a11y, auth errors |
| Scroll/layout blocking | **Complete** | Stack shell uses document scroll; body overflow restored |
| Docs refresh | **Complete** | `CURRENT_BUGS.md` superseded |

---

# Remaining Critical Tasks

## D3-C1 — MVP review & rating system (replaces mock profile stats) (QA-103)

**Status:** Complete in code; live Firestore requires deployed `reviews` rules.

**Problem:** Profile shows hardcoded lender scores, static review cards, and a fake 4.8 rating. Team decision: **build a real system**, not hide or label mocks.

**MVP scope (in scope):**
- Logged-in users can **create a review** (rating 1–5, optional comment).
- Reviews stored in **Firestore** via a service layer (`reviewService.ts` — no Firebase in UI).
- **Profile page** and **ProfileHeader** display:
  - Real **average rating** and **review count** computed from Firestore.
  - Real review list (reviewer display name, rating, comment, date).
  - **Empty state** when no reviews exist (no fake numbers).
- Remove all hardcoded `STATS`, `REVIEWS`, and `4.8 rating` values.
- **Listing detail:** re-add a reviews section **only** when real Firestore data exists; empty state otherwise. No static review cards or fake counts.

**Out of scope for MVP (unless time allows):**
- Transaction-verified reviews (only after completed borrow/trade).
- Review editing/deletion, reporting, photo attachments.
- Transaction enforcement, review editing/deletion, moderation, and attachments.
- Review prompts tied to messaging or listing status.

**Coordination:**
- Dev 3 owns UI + `reviewService` + Firestore schema proposal.
- Dev 1 adds `reviews` Firestore rules (read: public or authed; create: authed; update/delete: author only or disallow edits for MVP).

**Suggested schema (team to confirm):**
- Collection `reviews` with fields: `revieweeId`, `reviewerId`, `reviewerName`, `rating` (1–5), `comment?`, `createdAt`, optional `listingId`.

**Files:** `ProfilePage.tsx`, `ProfileHeader.tsx`, new `reviewService.ts`, `src/types/review.ts`, `firebaseCollections.ts`, `ListingDetailPage.tsx` (optional owner reviews section), `firestore.rules` (coordinate Dev 1)

**Acceptance criteria:**
- [ ] Profile and listing surfaces show **no fake** rating/review data.
- [ ] Real reviews display only when Firestore reviews exist.
- [ ] Empty review state when none exist.
- [ ] Signed-in user can submit 1–5 rating + optional comment.
- [ ] Average rating and count match stored reviews.

---

## D3-C2 — Remove Firebase Analytics (QA-006)

**Status:** Complete.

**Problem:** `getAnalytics(app)` is called unconditionally; crashes or errors when `app` is undefined (missing `.env`). Team decision: **Analytics not needed.**

**Work:**
- Remove `getAnalytics` import and `analytics` export from `src/lib/firebase.ts`.
- Remove any imports/usages of `analytics` elsewhere in the codebase.
- Remove `VITE_FIREBASE_MEASUREMENT_ID` from docs/examples if present (optional cleanup).
- App must load without Firebase env vars (dev warning only, no white screen).

**Files:** `src/lib/firebase.ts`, grep for `analytics` across `src/`

**Acceptance criteria:**
- [ ] `npm run build` passes without analytics.
- [ ] App does not crash if Firebase env vars are missing.
- [ ] No unused `firebase/analytics` imports remain.

---

## D3-C3 — Seed data cleanup for final demo

**Status:** Complete. Seed data is opt-in via `VITE_DEV_SEED_DATA=true`.

**Problem:** Seed listings and messages auto-populate **local** backends, causing fake owners (`seed-owner-*`), broken Follow demos, and confusion when Firestore is the submission backend.

**Confirmed behavior (code audit):**
| Backend | Seed usage |
|---------|------------|
| `VITE_LISTINGS_BACKEND=firestore` | **No seed** — `listingService.firestore.ts` reads Firestore only |
| `VITE_LISTINGS_BACKEND=local` | `listingService.dev.ts` returns `mockListings.seed` when localStorage key `gameshelf_listings` is empty |
| Messaging (always dev) | `messageService.dev.ts` seeds `mockMessages.seed` when localStorage keys empty |

**Work:**
- **Production/demo path (`firestore`):** No code change needed for listings — seed is already bypassed. Verify empty Firestore → dashboard empty state works.
- **Local backend:** Stop auto-seeding on first load for final demo builds, **or** gate seed behind explicit dev flag (e.g. `VITE_DEV_SEED_DATA=true`). Prefer empty feed + working empty states.
- **Messaging seed:** Stop auto-seeding inbox for demo; show inbox empty state. Preserve ability to seed in local dev if flag set (coordinate Dev 2 — do not rewrite `messageService.dev.ts` internals; Dev 3 may only adjust seed-if-empty entry or document Dev 2 change).
- **Do not** delete real Firestore documents.
- **Do not** break local dev: user can still create listings/messages manually; optional seed flag for solo dev.
- Deprecate or consolidate duplicate `src/data/listings.ts` if unused (verify imports first).

**Files:** `listingService.dev.ts`, `mockListings.seed.ts`, `mockMessages.seed.ts`, `DashboardPage.tsx`, `InboxPage.tsx` (empty states)

**Acceptance criteria:**
- [ ] Firestore listings still load after seed cleanup (no regression).
- [ ] Guest browsing still works with empty or real Firestore feed.
- [ ] Dashboard shows friendly empty state when no listings.
- [ ] Inbox shows empty state when no conversations (no forced seed threads in demo).
- [ ] Local dev fallback still works (create listing/message manually, or opt-in seed flag).

**Risks:** See report below — local dev without seed or user-created data shows empty app until someone creates content.

---

## D3-C4 — Signup Firestore write hardening (QA-007)

**Status:** Complete.

**Problem:** Signup path uses `setDoc(doc(db, ...))` directly instead of `requireFirestoreDb()`.

**Work:**
- Use same guard pattern as other auth/profile writes.
- Clear error if Firestore unavailable after Auth user created.

**Files:** `src/services/authService.ts`

---

## D3-C5 — Final QA pass & deployment verification (QA-109)

**Problem:** QA audit predates several Dev 3 fixes; evaluators need current truth.

**Work:**
- Run [E2E_TEST_PLAN.md](./E2E_TEST_PLAN.md) guest browse + auth return paths.
- Smoke-test **deployed** Hosting URL: SPA routes, Google login, password reset domain.
- Update or supersede `CURRENT_BUGS.md` with pointers to `QA_AUDIT_FINAL.md` + this doc.
- Confirm authorized domains in Firebase Console for production URL.

**Files:** `docs/CURRENT_BUGS.md` (update), team demo script

---

## D3-C6 — Coordinate guest Firestore read with Dev 1 (D1-C2)

**Status:** App route and rules changes complete locally; Dev 1 still needs final deploy with listings/storage rules.

**Problem:** Guest routes work in app, but Firestore may deny unauthenticated listing reads until rules updated.

**Work:**
- Verify logged-out browser loads feed when `VITE_LISTINGS_BACKEND=firestore`.
- If permission-denied, flag Dev 1 immediately — not a routing fix.
- Document demo requirement: rules must allow public listing read.

**Owner:** Dev 3 verifies; Dev 1 implements rules.

---

# Remaining Major Tasks

## D3-M1 — Follow UX for missing owner profiles (QA-102)

**Status:** Complete.

- Hide `FollowButton` when `getProfile(ownerId)` returns null.
- Less critical after D3-C3 seed cleanup in Firestore demo mode.
- Still relevant if local dev retains optional seed data.

**Files:** `FollowButton.tsx` and/or `ListingDetailPage.tsx`

---

## D3-M2 — Final UX polish

**Status:** Complete.

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

- Document: `VITE_LISTINGS_BACKEND=firestore` for cross-account listing demo.
- Document: messaging scope per Dev 2 decision.
- Document: reviews MVP — demo by creating a real review on profile (not fake stats).
- Document: empty feed/inbox expected when Firestore has no data and seed is disabled.

---

# Out of Scope

| Item | Owner / notes |
|------|----------------|
| Firestore rules structure fix | Dev 1 — QA-002 |
| Listings + Storage rules | Dev 1 — QA-003, QA-004 |
| **Reviews Firestore rules** | Dev 1 — coordinate with D3-C1 schema |
| Listing Firestore CRUD changes | Dev 1 — unless bug blocking guest read verification |
| `messageService.dev.ts` / Firestore messaging | Dev 2 |
| Wire Message Owner for signed-in users | Dev 2 — D2-C2 |
| Conversation deduplication | Dev 2 |
| **Transaction-verified reviews** (only after completed trade) | Future — unless time allows post-MVP |
| Review edit/delete, moderation, attachments | Future version |
| Advanced public profile features beyond read-only profile/listings/reviews | Future |
| Followers page | Out of product scope |
| Profile photo Storage upload | Product decision: URLs/initials/Google only |
| Firebase Analytics | **Removed per team decision** — not out of scope to delete |
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
- [ ] No **fake** review section or hardcoded review counts
- [ ] Owner manage actions still work for owner

## Reviews MVP (after D3-C1)

- [ ] Profile shows real average rating + count from Firestore (or empty state)
- [ ] Profile shows real review cards from Firestore (or “No reviews yet”)
- [ ] No hardcoded 4.8 rating or static `STATS` / `REVIEWS` arrays
- [ ] Logged-in user can submit rating 1–5 + optional comment
- [ ] New review appears on profile after refresh
- [ ] Listing detail shows real owner reviews if implemented (or no review block)

## Seed cleanup (after D3-C3)

- [ ] `VITE_LISTINGS_BACKEND=firestore`: feed loads real listings only (no seed injection)
- [ ] Empty Firestore → dashboard empty state (guest and signed-in)
- [ ] Guest browsing works with empty feed
- [ ] Inbox empty when no conversations (no forced seed in demo path)
- [ ] Local dev: can create listing without seed; optional dev seed flag documented

## Auth & profile

- [ ] Email signup → profile in Firestore
- [ ] Google login → photo on profile when available
- [ ] Forgot password email sends (deployed domain)
- [ ] Change password (email user) in Settings
- [ ] Edit profile persists after refresh
- [ ] Follow real user from listing → appears on Following page

## Analytics removal (after D3-C2)

- [ ] `npm run build` passes with no `firebase/analytics` import
- [ ] App loads without `.env` in dev — warning only, no crash

## Firebase resilience (after D3-C4)

- [ ] App loads without `.env` in dev — warning only, no crash
- [ ] Signup with valid Firebase config creates Auth + Firestore user doc

## Deployment (D3-C5)

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
3. **Review MVP shipped:** No fake stats/reviews/ratings anywhere; real Firestore reviews with empty states when none exist.
4. **Analytics removed** — app builds and runs without `getAnalytics` or unused analytics imports.
5. **Seed cleanup complete** — demo/Firestore path has no auto-injected seed listings or messages; empty states work; local dev fallback preserved.
6. **Firebase init** does not crash without `.env`; signup uses consistent Firestore guards.
7. **Follow UX** does not show confusing errors when owner profile missing.
8. **Deployed site** smoke-tested; authorized domains confirmed; demo script updated.
9. **Final QA** completed per checklist; bug doc refreshed or superseded.
10. **`npm run build` passes**; no changes to messaging service internals or listing CRUD unless coordinated bugfix.

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
| `src/pages/ProfilePage.tsx` | **Review MVP — remove STATS/REVIEWS mocks** |
| `src/components/ProfileHeader.tsx` | **Review MVP — real average rating** |
| `src/services/reviewService.ts` | **New — Firestore reviews CRUD** |
| `src/types/review.ts` | **New — Review type** |
| `src/lib/firebase.ts` | **Remove Analytics** |
| `src/services/listingService.dev.ts` | **Seed cleanup** |
| `src/data/mockListings.seed.ts` | Seed data (local only) |
| `src/data/mockMessages.seed.ts` | Seed data (messaging dev only) |
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

*Last updated: July 2026 — review MVP, analytics removal, and seed cleanup decisions applied.*
