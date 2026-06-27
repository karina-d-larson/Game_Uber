# GameShelf — Final Working App Backlog

**Purpose:** Two-week backlog to reach a **working final-project app** after Sprint 1  
**Sources:** [QA_AUDIT_FINAL.md](./QA_AUDIT_FINAL.md), sprint docs, [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md), code verification (June 2026)  
**Rule:** Tasks are **not marked complete** unless verified in current code. Partial/in-code-but-unverified items are noted explicitly.

---

## Goal

Deliver a demo-ready GameShelf where:

- **Guests** can browse listings and open listing details without an account.
- **Signed-in users** can create listings, message owners, follow users, and manage profile/settings — with data persisting in **Firestore** (not single-browser localStorage).
- **No dead buttons** on primary flows; mock content is **hidden or clearly labeled**.
- **Firebase rules, Storage, and Hosting** deploy successfully for team QA and presentation.

**Duration:** 2 weeks (Final Project sprint)  
**Team:** Dev 1 (Listings/Firebase) · Dev 2 (Messaging) · Dev 3 (Auth/Profile/App flow)

**Related docs:**

- [SPRINT1_OVERVIEW.md](./SPRINT1_OVERVIEW.md) — architecture rules (still apply)
- [QA_AUDIT_FINAL.md](./QA_AUDIT_FINAL.md) — issue IDs referenced as QA-xxx
- [E2E_TEST_PLAN.md](./E2E_TEST_PLAN.md) — manual test scripts

---

## New product requests (Final Project)

### 1. Guest browsing

| Requirement | Current code state |
|-------------|-------------------|
| Guests browse feed + listing detail | **Done** — `/` and `/listings/:id` are public routes in `AppRouter.tsx` |
| Account only for create / message / follow / profile | **Done** — create, inbox, profile, settings, edit, chat behind `ProtectedRoute`; guests gated on CTAs via `useRequireAuth()` |
| Protected actions redirect to login with return URL | **Done** — `buildLoginRedirect()`, `useRequireAuth()`, `BottomNav` auth tabs, `getPostAuthPath()` after login |

### 2. Search improvements

| Requirement | Current code state |
|-------------|-------------------|
| Partial/close matches on game names | **Done** — `listingSearch.ts` (normalized substring + per-token word prefix match, e.g. `"cat"` → `"Catan"`) |
| Search works with filters | **Done** — client-side AND logic in `filterListings()` |
| Filters optional (not all required) | **Done** — only purpose toggle is always set; category and exchange filters optional |
| Search includes title + categories | **Done** — `listingMatchesSearch()` checks title + `categories[]` |
| Friendly empty state | **Done** — `DashboardPage.tsx` shows filter-aware “No listings match your search…” copy |

### 3. Listing detail layout polish

| Requirement | Current code state |
|-------------|-------------------|
| Side-by-side image + key info on desktop/tablet | **Done** — `ListingDetailPage.tsx` md grid (5/7 columns) |
| Smaller image, not full first screen | **Done** — max height ~280–400px by breakpoint |
| Key info visible quickly | **Done** — title, status, condition, arrangement/request options, owner, CTAs in right column |
| Request listings compact (no empty image space) | **Done** — image column only for offers |
| Mock reviews removed/hidden | **Done** — “What borrowers say” / fake review section removed from listing detail |

---

## Verified complete (do not re-implement)

Code-verified only — use as baseline, not backlog work:

| Area | Evidence |
|------|----------|
| Email/password + Google auth | `authService.ts`, `AuthContext`, login/signup pages |
| Forgot + change password | `sendPasswordReset`, `changePassword`, Settings/Login UI |
| Profile edit + settings + preferences | `EditProfilePage`, `SettingsPage`, `userService` |
| Avatar (Google / initials / URL) | `Avatar.tsx`, `avatarDisplay.ts` |
| Follow system (real Firestore users) | `FollowButton`, `FollowingPage`, `userService.followUser` |
| Offer/Request listing UI + form | `ListingForm`, `DashboardPage`, `ListingCard` |
| Firestore listings CRUD | `listingService.firestore.ts` — listings use Firestore backend |
| Firebase Storage listing image upload | `uploadListingImageFirebase` wired and working |
| Messaging UI + localStorage backend | `InboxPage`, `ChatPage`, `messageService.dev.ts` |
| Guest browsing (feed + detail) | `AppRouter.tsx`, `useRequireAuth`, `BottomNav` |
| Search partial/close match | `listingSearch.ts`, `listingFilters.ts` |
| Listing detail layout polish | `ListingDetailPage.tsx` side-by-side layout, mock reviews removed |
| `.env.example` | Exists with Firebase + backend flags documented |
| Firebase Hosting deployed | Production deploy + authorized domain confirmed (team) |
| `npm run build` | Passes after Dev 3 UX changes |

---

# Dev 1 — Listings / Firebase

## D1-001 — Fix invalid `firestore.rules` structure

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Owner** | Dev 1 (coordinate Dev 3 for users block) |
| **Status** | Not started |
| **QA ref** | QA-002 |
| **Files** | `firestore.rules` |
| **Problem** | Orphan `match /users/{userId}` block outside `service cloud.firestore`. |
| **Acceptance criteria** | Single valid rules file; `firebase deploy --only firestore:rules` succeeds. |
| **Testing** | Deploy rules; confirm no parser errors in Firebase Console. |

---

## D1-002 — Add Firestore rules for `listings`

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Owner** | Dev 1 |
| **Status** | Not started |
| **QA ref** | QA-004 |
| **Files** | `firestore.rules` |
| **Acceptance criteria** | Authenticated users can read listings; create when authed; update/delete only when `request.auth.uid == resource.data.ownerId`. **Coordinate with D3-001** if guest read is required (`allow read: if true` or equivalent for listings only). |
| **Testing** | Two accounts: B reads A’s listing; B cannot edit/delete A’s listing; A can CRUD own listing. |

---

## D1-003 — Create `storage.rules`

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Owner** | Dev 1 |
| **Status** | Not started |
| **QA ref** | QA-003 |
| **Files** | `storage.rules` (new), `firebase.json` |
| **Acceptance criteria** | File exists; auth required for writes under `listings/{uid}/{listingId}/`; image content-type and size limits aligned with 2 MB client cap (`imageFile.ts`). |
| **Testing** | `firebase deploy --only storage`; offer image upload succeeds; unauthenticated upload denied. |

---

## D1-004 — Verify Firestore listings CRUD end-to-end

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Owner** | Dev 1 |
| **Status** | Partial — code exists, not team-verified |
| **QA ref** | QA-106, QA-107 |
| **Files** | `listingService.firestore.ts`, `listingService.ts`, `.env.example` |
| **Acceptance criteria** | With `VITE_LISTINGS_BACKEND=firestore`: create, read, update, delete work; listing visible in second browser/account; localStorage seed not used for feed. |
| **Testing** | Account A creates offer + request; Account B sees both on home after refresh. |

---

## D1-005 — Verify offer listing image upload (Storage)

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 1 |
| **Status** | Partial — `uploadListingImageFirebase` wired; rules + live test pending |
| **Files** | `storageService.ts`, `listingService.firestore.ts`, `ImageUploader.tsx` |
| **Acceptance criteria** | Offer create/update stores HTTPS URL in `imageUrls[]`; not base64 in Firestore; request listings never upload. |
| **Testing** | Create offer with JPEG ≤ 2 MB; detail page shows image; second account sees image. |

---

## D1-006 — Document and align listings backend default for final demo

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 1 |
| **Status** | Not started (docs/env mismatch) |
| **QA ref** | QA-106 |
| **Files** | `.env.example`, `docs/FIREBASE_REFERENCE.md`, team README or this backlog |
| **Acceptance criteria** | Team agrees on `VITE_LISTINGS_BACKEND=firestore` for submission; `.env.example` comments explain local vs firestore. |
| **Testing** | Fresh clone + `.env` → cross-account listing test passes. |

---

## D1-007 — Search: partial and close matching on game names

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 3 *(implemented)* |
| **Status** | **Complete** — see D3-013 |
| **Files** | `src/utils/listingSearch.ts`, `src/utils/listingFilters.ts`, `DashboardPage.tsx` |
| **Acceptance criteria** | Search matches partial title (e.g. `"cat"` → `"Catan"`); token/word-prefix matching; works with category + exchange + purpose filters; searches title + categories. |
| **Testing** | Type partial game name → correct cards remain; apply category filter + search → intersection only; clear search → filter-only results. |

---

## D1-008 — Search/filter UX: optional filters clarity

| Field | Value |
|-------|-------|
| **Priority** | Minor |
| **Owner** | Dev 1 |
| **Status** | Mostly done — verify only |
| **Files** | `DashboardPage.tsx`, `CategoryChips.tsx`, `MarketplaceToggle.tsx` |
| **Acceptance criteria** | No filter except Offer/Request toggle is required; “All types” clears exchange filter; empty state copy reflects active filters. |
| **Testing** | Purpose=Offers, no category, no exchange, no search → all offers shown. |

---

## D1-009 — Listing detail mock reviews: hide or label

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 3 *(implemented)* |
| **Status** | **Complete** — mock review section removed from listing detail |
| **QA ref** | QA-103 |
| **Files** | `src/pages/ListingDetailPage.tsx` |
| **Acceptance criteria** | “What borrowers say”, fake review, and “Read all 42 reviews” removed **or** labeled “Sample data” / hidden until reviews feature exists. |
| **Testing** | Listing detail shows no misleading review counts. |

---

## D1-010 — Wire or hide “Request Game” / “I have this game” CTAs

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 1 · Dev 2 (if messaging is the action) |
| **Status** | Not started — buttons have no handlers |
| **QA ref** | QA-001 |
| **Files** | `src/pages/ListingDetailPage.tsx` |
| **Acceptance criteria** | Either implement meaningful action (e.g. open message flow) **or** hide buttons until implemented; no silent dead clicks. |
| **Testing** | Click each CTA → navigates or shows disabled state with explanation. |

---

## D1-011 — Guest-readable listings in Firestore rules

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Owner** | Dev 1 (rules) · Dev 3 (routing) |
| **Status** | Not started |
| **Files** | `firestore.rules`, `listingService.firestore.ts` |
| **Acceptance criteria** | Unauthenticated clients can **read** `listings`; writes still require auth + ownership. Align with [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md) update. |
| **Testing** | Logged-out browser loads feed and listing detail against Firestore backend. |

---

# Dev 2 — Messaging

## D2-001 — Implement `messageService.firestore.ts`

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Owner** | Dev 2 |
| **Status** | Not started |
| **QA ref** | QA-005 |
| **Files** | `src/services/messageService.firestore.ts` (new), `src/services/messageService.ts`, `src/config/firebaseCollections.ts` |
| **Acceptance criteria** | `fetchConversations`, `fetchMessages`, `sendMessage`, `createConversation` persist to Firestore; router uses Firestore when configured (mirror listings backend pattern or always Firestore for messaging in final app). |
| **Testing** | Send message → hard refresh → message still present. |

---

## D2-002 — Firestore rules for conversations and messages

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Owner** | Dev 2 |
| **Status** | Not started |
| **Files** | `firestore.rules` |
| **Acceptance criteria** | Only conversation participants can read/write their threads; create allowed for authenticated users who are participants. |
| **Testing** | Account C cannot read A↔B thread; A and B can. |

---

## D2-003 — Wire Message Owner and Message requester buttons

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Owner** | Dev 2 |
| **Status** | Not started |
| **QA ref** | QA-001, QA-104 |
| **Files** | `src/pages/ListingDetailPage.tsx`, `src/context/MessagesContext.tsx`, `src/services/messageService.ts` |
| **Acceptance criteria** | Clicking button calls `createConversation({ listingId, recipientId })`, navigates to `ROUTES.chat(conversationId)`; guest click redirects to login with return path (coordinate D3-003). |
| **Testing** | Signed-in user on another user’s listing → Message Owner → chat opens. |

---

## D2-004 — Expose `createConversation` on MessagesContext

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 2 |
| **Status** | Not started |
| **QA ref** | QA-104 |
| **Files** | `src/context/MessagesContext.tsx` |
| **Acceptance criteria** | Context exposes `createConversation`; inbox refreshes after create; pages do not import Firebase directly. |
| **Testing** | Create conversation from listing → appears in inbox without manual refresh (or after explicit refresh call). |

---

## D2-005 — Conversation deduplication

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 2 |
| **Status** | Not started — dev backend always creates new thread |
| **QA ref** | QA-105 |
| **Files** | `messageService.firestore.ts`, `messageService.dev.ts` |
| **Acceptance criteria** | Same `listingId` + same two participant IDs → returns existing conversation, no duplicate inbox rows. |
| **Testing** | Message Owner twice on same listing → single thread. |

---

## D2-006 — Resolve participant display names in conversations

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 2 |
| **Status** | Not started — dev uses `'Recipient'` placeholder |
| **QA ref** | QA-105 |
| **Files** | `messageService.dev.ts`, `messageService.firestore.ts` |
| **Acceptance criteria** | Inbox shows listing owner/requester display name from listing or `userService.getProfile`. |
| **Testing** | Inbox thread title matches other participant’s display name. |

---

## D2-007 — Cross-account messaging persistence

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Owner** | Dev 2 |
| **Status** | Not started |
| **QA ref** | QA-005, QA-110 |
| **Acceptance criteria** | Account A sends message; Account B sees it in inbox after refresh (Firestore, not localStorage). |
| **Testing** | Two browsers, two accounts, one listing — full message round-trip. |

---

## D2-008 — Decide: Firestore messaging vs local/demo-only

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Owner** | Dev 2 · Team decision |
| **Status** | Decision required |
| **Acceptance criteria** | **Option A:** Ship D2-001–D2-007 (recommended for final project). **Option B:** Keep localStorage backend and add in-app banner “Messaging demo — single browser only” on Inbox; hide Message buttons until Firestore ready. |
| **Testing** | Document chosen path in README; demo script matches reality. |

---

## D2-009 — Wire or hide “I have this game” (request response)

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 2 (message flow) · Dev 1 (UI) |
| **Status** | Not started |
| **Files** | `ListingDetailPage.tsx` |
| **Acceptance criteria** | Opens message to requester (same as Message requester) or hidden until defined. |
| **Testing** | Request listing → action works or is not shown. |

---

# Dev 3 — Auth / Profile / App Flow

## D3-001 — Guest browsing: public routes for feed and listing detail

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Owner** | Dev 3 |
| **Status** | **Complete** |
| **Files** | `src/routes/AppRouter.tsx`, `src/routes/guards/*` |
| **Acceptance criteria** | `/` (dashboard/feed) and `/listings/:id` accessible without login; login/signup remain guest-only routes. |
| **Testing** | Incognito window opens home and listing detail without redirect to `/login`. |

---

## D3-002 — Guest shell UX (nav without authenticated tabs)

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 3 |
| **Status** | **Complete** |
| **Files** | `BottomNav.tsx`, `DashboardPage.tsx` |
| **Acceptance criteria** | Guests see browse UI; Create/Inbox/Profile tabs redirect to login; Home/browse works; guest sign-in prompt on dashboard. |
| **Testing** | Guest taps Profile → login with return to profile. |

---

## D3-003 — Protected action redirect helper

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Owner** | Dev 3 |
| **Status** | **Complete** |
| **Files** | `src/utils/authRedirect.ts`, `src/hooks/useRequireAuth.ts`, `BottomNav.tsx`, `ListingDetailPage.tsx` |
| **Acceptance criteria** | Guest actions (create listing, message, follow, profile/settings) navigate to `/login` with `state.from` set to current path; after login/signup/Google, user returns via `getPostAuthPath()`. Follow button hidden for guests on listing detail. |
| **Testing** | Guest on listing → Message Owner → login → returns to listing. |

---

## D3-013 — Search usability improvements

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 3 |
| **Status** | **Complete** |
| **Files** | `src/utils/listingSearch.ts`, `src/utils/listingFilters.ts`, `DashboardPage.tsx` |
| **Acceptance criteria** | Partial/close matches on title and categories; search combines with purpose, category, and exchange filters (AND logic); filters optional; friendly empty state when no matches. |
| **Testing** | `"cat"` finds `"Catan"`; search + category + Offers/Requests toggle work together; empty state appears when no results. |

---

## D3-014 — Listing detail layout polish

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 3 |
| **Status** | **Complete** |
| **Files** | `src/pages/ListingDetailPage.tsx` |
| **Acceptance criteria** | Desktop/tablet: image left (~360–420px max height), key info + CTAs right; mobile: stacked with capped image height; request listings skip image column; description/tutorial/location below hero; owner actions intact. |
| **Testing** | Offer with/without image balanced; request has no empty image space; key info visible without excessive scroll. |

---

## D3-004 — Guard Firebase analytics init

| Field | Value |
|-------|-------|
| **Priority** | Critical |
| **Owner** | Dev 3 |
| **Status** | Not started |
| **QA ref** | QA-006 |
| **Files** | `src/lib/firebase.ts` |
| **Acceptance criteria** | App loads without `.env`; no `getAnalytics(undefined)` crash. |
| **Testing** | Remove/rename `.env` → `npm run dev` → app renders with warning, no white screen. |

---

## D3-005 — Signup Firestore write hardening

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 3 |
| **Status** | Not started |
| **QA ref** | QA-007 |
| **Files** | `src/services/authService.ts` |
| **Acceptance criteria** | Signup uses `requireFirestoreDb()` (or equivalent) before `setDoc`; clear error if Firestore unavailable. |
| **Testing** | Signup with valid Firebase config creates Auth user + `users/{uid}` doc. |

---

## D3-006 — Remove or label mock profile stats and reviews

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 3 |
| **Status** | Not started |
| **QA ref** | QA-103 |
| **Files** | `src/pages/ProfilePage.tsx`, `src/components/ProfileHeader.tsx` |
| **Acceptance criteria** | Hardcoded STATS, REVIEWS, and “4.8 rating” hidden or labeled “Sample data”; no fake lender scores in production UI. |
| **Testing** | Profile page shows only real user data from Auth/Firestore. |

---

## D3-007 — Fix or hide “View full profile” on listing detail

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 3 |
| **Status** | Not started |
| **QA ref** | QA-101 |
| **Files** | `src/pages/ListingDetailPage.tsx` |
| **Acceptance criteria** | Link removed until public profiles exist, or routes to owner profile when that feature ships. |
| **Testing** | Link does not send user to own profile when viewing someone else’s listing. |

---

## D3-008 — Follow UX for missing owner profiles

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 3 |
| **Status** | Not started |
| **QA ref** | QA-102 |
| **Files** | `src/components/FollowButton.tsx`, `src/services/userService.ts` |
| **Acceptance criteria** | Hide Follow when owner has no Firestore user doc (seed listings), or show clear message; works for real listing owners. |
| **Testing** | Follow on user-created listing succeeds; seed listing does not show confusing error (or button hidden). |

---

## D3-009 — Final button and dead-UI audit

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 3 |
| **Status** | Partial — profile header cleaned; listing detail not done |
| **QA ref** | QA-001 |
| **Files** | All pages — especially `ListingDetailPage.tsx` |
| **Acceptance criteria** | No button renders without handler or explicit disabled+tooltip; team sign-off checklist completed. |
| **Testing** | Full click-through per [E2E_TEST_PLAN.md](./E2E_TEST_PLAN.md). |

---

## D3-010 — Firebase Hosting deploy + authorized domains

| Field | Value |
|-------|-------|
| **Priority** | Major |
| **Owner** | Dev 3 |
| **Status** | **Complete** — deployed; authorized domain added (team confirmed) |
| **QA ref** | QA-109 |
| **Files** | `firebase.json`, `.firebaserc`, Firebase Console |
| **Acceptance criteria** | `npm run build && firebase deploy` succeeds; Google login and password reset work on deployed URL. |
| **Testing** | Deployed smoke test checklist below. |

---

## D3-011 — Update stale team docs

| Field | Value |
|-------|-------|
| **Priority** | Minor |
| **Owner** | Dev 3 · Shared |
| **Status** | Not started |
| **QA ref** | QA-108 |
| **Files** | `docs/CURRENT_BUGS.md`, `docs/SPRINT1_DEV1_FIREBASE_LISTINGS.md` (status table) |
| **Acceptance criteria** | Bug doc reflects current build; Dev 1 doc notes Storage wiring in code vs verification gap. |
| **Testing** | New teammate reads docs without false blockers. |

---

## D3-012 — PWA / branding consistency

| Field | Value |
|-------|-------|
| **Priority** | Minor |
| **Owner** | Dev 3 |
| **Status** | Not started |
| **QA ref** | QA-201 |
| **Files** | `vite.config.ts` |
| **Acceptance criteria** | Manifest uses “GameShelf” naming consistently. |
| **Testing** | Install PWA → correct name shown. |

---

# Cross-team coordination

| Topic | Owners | Notes |
|-------|--------|-------|
| `firestore.rules` merge | Dev 1 → Dev 2 → Dev 3 | Single PR preferred; guest listing read affects all |
| `ListingDetailPage.tsx` | Dev 1, Dev 2, Dev 3 | CTAs, reviews, follow, profile link |
| Guest browse + listing read rules | Dev 1 + Dev 3 | Must ship together |
| `.env.example` | Dev 1 + Dev 3 | Backend flag + Firebase keys |
| `AppRouter.tsx` | Dev 3 primary | Dev 2 for inbox/chat guest behavior |

---

# Final demo readiness checklist

Use before presentation or submission:

- [ ] `npm run build` passes
- [ ] `VITE_LISTINGS_BACKEND=firestore` documented and used for demo
- [ ] `firestore.rules` + `storage.rules` deployed
- [x] Guest can browse home + listing detail without account
- [x] Guest prompted to log in for create / message / follow / profile
- [x] Post-login returns to intended page
- [ ] Two real accounts: shared listings visible
- [ ] Message Owner opens chat (Firestore) **or** team discloses local-only messaging
- [ ] Follow works on real-user listing
- [ ] No mock stats/reviews presented as real *(listing detail done; profile mock stats remain — D3-006)*
- [ ] No dead buttons on listing detail *(guest CTAs redirect to login; signed-in CTAs still unwired — D1-010 / D2-003)*
- [x] Search partial match demonstrated on title
- [ ] Google login works (local or deployed)
- [ ] Optional: live Hosting URL tested

---

# Two-account testing checklist

| Step | Account A | Account B | Pass? |
|------|-----------|-----------|-------|
| 1 | Create Offer listing (+ optional image) | — | |
| 2 | — | Sees listing on home | |
| 3 | — | Opens listing detail | |
| 4 | — | Message Owner → chat | |
| 5 | — | Send message | |
| 6 | Refresh | Sees message in inbox | |
| 7 | — | Follow A from listing | |
| 8 | — | Following page lists A | |
| 9 | Edit profile display name | Sees updated `ownerName` on listing* | |

\*May require listing refresh or denormalized name update — document if stale.

---

# Deployed-site smoke test checklist

After `firebase deploy`:

- [ ] `/` loads (SPA rewrite)
- [ ] Deep link `/listings/:id` loads after refresh
- [ ] `/login`, `/signup` load
- [ ] Protected routes redirect guests to login
- [ ] Google sign-in (authorized domain configured)
- [ ] Email login + logout
- [ ] Create listing (if build env used `firestore`)
- [ ] Browser console: no fatal errors on load
- [ ] Password reset email link uses correct auth domain (manual)

---

# Out of scope (Final Project)

| Item | Notes |
|------|-------|
| Public profile pages (`/users/:id`) | Hide links until built |
| Followers page | Per PRODUCT_DECISIONS |
| Real reviews/ratings system | Hide mock content instead |
| Real-time `onSnapshot` everywhere | Fetch-on-load sufficient |
| Push notifications, read receipts, typing | Dev 2 sprint out of scope |
| Firebase Storage for profile photos | URLs/initials/Google only |
| Playwright E2E suite | Recommended post-submit; see E2E_TEST_PLAN |
| Storage orphan cleanup on listing delete | Document deferral |
| Account linking (Google + email) | Not planned |
| Advanced search (geo, fuzzy library) | Partial substring only unless D1-007 expanded |

---

# Top 10 highest-priority remaining tasks

| Rank | ID | Task | Owner |
|------|-----|------|-------|
| 1 | D1-001 | Fix invalid `firestore.rules` structure | Dev 1 |
| 2 | D1-002 / D1-011 | Listings Firestore rules + guest read | Dev 1 + Dev 3 |
| 3 | D1-003 | Add missing `storage.rules` | Dev 1 |
| 4 | ~~D3-001 / D3-003~~ | ~~Guest browsing + protected-action redirect~~ **Complete** | Dev 3 |
| 5 | D2-001 / D2-003 / D2-008 | Firestore messaging **or** explicit demo-only decision | Dev 2 |
| 6 | D2-003 | Wire Message Owner / Message requester | Dev 2 |
| 7 | D1-004 | Verify Firestore listings CRUD two-account | Dev 1 |
| 8 | D3-006 | Remove or label mock **profile** stats/reviews | Dev 3 |
| 9 | D1-010 | Wire or hide remaining dead listing CTAs | Dev 1 + Dev 2 |
| 10 | D3-004 | Guard Firebase analytics init (no `.env` crash) | Dev 3 |

---

# Suggested two-week schedule

### Week 1

- **Dev 1:** D1-001, D1-002, D1-003, D1-004, D1-011, D1-007  
- **Dev 2:** D2-008 decision, D2-001, D2-002, D2-004, D2-005  
- **Dev 3:** ~~D3-001, D3-002, D3-003, D3-013, D3-014~~ done; D3-004, D3-005  

### Week 2

- **Dev 1:** D1-005, D1-006, D1-009, D1-010, D1-008  
- **Dev 2:** D2-003, D2-006, D2-007, D2-009  
- **Dev 3:** D3-006, D3-007, D3-008, D3-009, D3-010, D3-011  

**End of week 2:** Run demo readiness + two-account + deployed smoke checklists.

---

*Last updated: June 2026 — Dev 3 guest browsing, search, and listing detail layout marked complete.*
