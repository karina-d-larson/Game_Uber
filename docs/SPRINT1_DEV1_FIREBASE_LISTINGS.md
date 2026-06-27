# Final Project — Dev 1: Listings & Firebase

**Owner:** Developer 1  
**Period:** Final two-week development sprint (post–Sprint 1)  
**App:** GameShelf  
**Sources:** [QA_AUDIT_FINAL.md](./QA_AUDIT_FINAL.md) · [FINAL_WORKING_APP_BACKLOG.md](./FINAL_WORKING_APP_BACKLOG.md) · [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md)

Dev 1 owns **Firestore rules, Storage rules, listing image integration, listing permissions, and listing Firebase QA**. Dev 1 does **not** own guest browsing, search improvements, or listing detail layout (Dev 3).

---

# Current Status

Verified against source code (June 2026). Items marked complete should not be re-implemented unless regression is found.

## Listings application layer — complete

| Area | Status | Evidence |
|------|--------|----------|
| Offer/Request model | **Complete** | `listingPurpose`, `requestOptions`, purpose-specific form/cards/detail |
| Multi-category support | **Complete** | `categories[]` with legacy `category` fallback |
| Listing CRUD service (Firestore) | **Complete in code** | `listingService.firestore.ts` — fetch, get, create, update, delete with ownership checks |
| Backend router | **Complete** | `listingService.ts` routes to `local` or `firestore` via `VITE_LISTINGS_BACKEND` |
| Offer image upload (Firebase Storage) | **Complete in code** | `uploadListingImageFirebase()` in `storageService.ts`; wired in create/update for offers only |
| Request listings — no photos | **Complete** | Form and Firestore path force `imageUrls: []`; no upload for requests |
| Client image validation | **Complete** | JPEG/PNG/WebP, 2 MB max (`imageFile.ts`) |
| Storage path pattern | **Complete** | `listings/{userId}/{listingId}/{timestamp}-{filename}` |
| Listing form, cards, filters (UI) | **Complete** | `ListingForm`, `ListingCard`, `DashboardPage`, `listingFilters.ts` |
| Owner actions on detail page | **Complete** | Edit, delete, mark unavailable/close request (`ListingDetailPage.tsx`) |
| `.env.example` | **Complete** | Documents `VITE_LISTINGS_BACKEND=firestore` and Firebase keys |
| `npm run build` | **Passing** | Verified after recent changes |

## Firebase configuration — partial

| Area | Status | Evidence |
|------|--------|----------|
| `firebase.json` | **Complete** | References `firestore.rules`, `storage.rules`, Hosting (`dist`) |
| `.firebaserc` | **Complete** | Project id configured |
| Firebase SDK bootstrap | **Complete** | `src/lib/firebase.ts` — Auth, Firestore, Storage when env set |
| Firestore users rules | **Partial** | Valid block inside `service cloud.firestore`; **orphan duplicate block outside service** (QA-002) |
| Firestore listings rules | **Not done** | No `match /listings/{id}` rules (QA-004) |
| Guest-readable listings | **Not done** | Required for Dev 3 guest browse against Firestore — `allow read: if true` on listings only (coordinate with Dev 3) |
| `storage.rules` | **Missing** | Referenced in `firebase.json` but file not in repo (QA-003) |
| Firestore messaging rules | **Not Dev 1** | Dev 2 scope |

## Explicitly not Dev 1 (completed elsewhere)

| Area | Owner | Status |
|------|-------|--------|
| Guest browsing (public feed + detail routes) | Dev 3 | **Complete** |
| Search partial/close match | Dev 3 | **Complete** — `listingSearch.ts` |
| Listing detail layout polish | Dev 3 | **Complete** — side-by-side layout, mock reviews removed |
| Message Owner / Requester CTAs | Dev 2 | **Partial** — guests redirect to login; signed-in users not wired to messaging |

---

# Remaining Critical Tasks

Must finish before final submission. QA references from [QA_AUDIT_FINAL.md](./QA_AUDIT_FINAL.md).

## D1-C1 — Fix invalid `firestore.rules` structure (QA-002)

**Problem:** Lines 6–10 define `match /users/{userId}` **outside** `service cloud.firestore { ... }`. Duplicate users block exists inside the service block.

**Work:**
- Remove the orphan outer block.
- Consolidate into one valid rules file.
- Ensure `firebase deploy --only firestore:rules` succeeds with no parser errors.

**Files:** `firestore.rules`

---

## D1-C2 — Add Firestore security rules for `listings` (QA-004, D1-011)

**Problem:** Listings CRUD has no rules. Creates/updates may be permission-denied or insecure depending on Console defaults.

**Work:**
- Add `match /listings/{listingId}` with:
  - **Read:** unauthenticated allowed (guest browse) **or** authenticated — align with Dev 3 public routes.
  - **Create:** authenticated; `request.auth.uid == request.resource.data.ownerId`.
  - **Update/delete:** authenticated; `request.auth.uid == resource.data.ownerId`.
- Do **not** modify `users/{userId}` rules beyond cleanup in D1-C1 unless coordinating with Dev 3.

**Files:** `firestore.rules`

**Coordination:** Dev 3 ships guest-readable feed/detail; rules must allow unauthenticated **read** on listings collection only.

---

## D1-C3 — Create and deploy `storage.rules` (QA-003)

**Problem:** `firebase.json` references `storage.rules`; file is missing. Deploy fails or Storage behavior is undefined.

**Work:**
- Create `storage.rules` at repo root.
- Require authentication for writes under `listings/{userId}/{listingId}/`.
- Restrict content type to images; align max size with 2 MB client cap.
- Deny unauthenticated writes.
- Verify `firebase deploy --only storage` succeeds.

**Files:** `storage.rules`, `firebase.json` (verify reference only)

---

## D1-C4 — Two-account Firestore listings QA (QA-106, QA-107)

**Problem:** Code default for `VITE_LISTINGS_BACKEND` is `local` if env unset. Cross-browser listing tests fail in local mode.

**Work:**
- Confirm team demo/submission uses `VITE_LISTINGS_BACKEND=firestore`.
- Run two-account test: Account A creates offer (+ optional image) and request; Account B sees both on home and detail after refresh.
- Verify B cannot edit/delete A’s listings.
- Document any env/setup steps for teammates.

**Files:** `.env.example` (comments only if needed), team README or handoff note — **do not commit secrets**.

---

## D1-C5 — End-to-end offer image upload verification (QA-003, QA-004)

**Problem:** Upload code exists but rules were missing at audit time; live upload may fail.

**Work:**
- With Storage rules deployed: create offer with JPEG ≤ 2 MB.
- Confirm HTTPS URL in `imageUrls[]` (not base64 in Firestore).
- Confirm second account/browser sees image on feed and detail.
- Confirm request listing create path never writes to Storage.

**Files:** `listingService.firestore.ts`, `storageService.ts`, `ImageUploader.tsx` — verify only; change CRUD only if bug found.

---

# Remaining Major Tasks

Complete if time allows after critical tasks.

## D1-M1 — Align listings backend documentation (QA-106)

- Ensure `.env.example` comments explain `local` vs `firestore` and that final demo requires `firestore`.
- Note in handoff: fresh clone without `.env` defaults to localStorage + seed.

## D1-M2 — Listing image accessibility (QA-204)

- Replace empty `alt` on listing images in `ListingCard.tsx` and any remaining listing display components Dev 1 touches.
- Use listing title: e.g. `Photo of {title}`.

## D1-M3 — Use `ROUTES` constants in listing navigation (QA-209)

- `ListingCard.tsx`: use `ROUTES.listing(id)` instead of hardcoded path string.

## D1-M4 — Storage orphan cleanup on listing delete

- **Deferred unless quick:** deleting a listing does not remove Storage objects. Document deferral or implement cleanup in `listingService.firestore.ts` delete path.

## D1-M5 — Seed listings behavior in Firestore mode

- Clarify with team: seed data (`mockListings.seed.ts`) applies in local mode only. In Firestore mode, feed is Firestore-only. Document for demo script.

---

# Out of Scope

| Item | Owner / notes |
|------|----------------|
| Guest browsing, public routes, login redirects | Dev 3 — **complete** |
| Search improvements (`listingSearch.ts`, filter UX) | Dev 3 — **complete** |
| Listing detail layout redesign | Dev 3 — **complete** |
| Message Owner / Requester / I have this game wiring | Dev 2 |
| Firestore messaging backend and conversation rules | Dev 2 |
| Profile mock stats/reviews cleanup | Dev 3 |
| `messageService.dev.ts` internals | Dev 2 — do not modify |
| Auth, signup hardening, analytics guard | Dev 3 |
| Firebase Hosting deploy and authorized domains | Dev 3 (verify); Dev 1 supports rules deploy |
| Public profile pages (`/users/:id`) | Future version |
| Real-time `onSnapshot` on listings feed | Future version |
| Advanced search (geo, fuzzy library) | Dev 3 / future |
| Automated E2E tests | Post-submit recommendation |

---

# Testing Checklist

Run with `VITE_LISTINGS_BACKEND=firestore` and deployed rules unless noted.

## Rules deploy

- [ ] `firebase deploy --only firestore:rules` — no errors
- [ ] `firebase deploy --only storage` — no errors
- [ ] Firebase Console shows single valid rules tree (no orphan blocks)

## Guest read (coordinate Dev 3)

- [ ] Logged-out browser loads home feed from Firestore (not permission-denied)
- [ ] Logged-out browser opens `/listings/:id` for an existing listing

## Two-account listings

- [ ] Account A: create **Offer** with title, categories, arrangement, optional image
- [ ] Account A: create **Request** (no image field in UI)
- [ ] Account B: sees both listings on home after refresh
- [ ] Account B: opens each listing detail
- [ ] Account B: cannot edit or delete A’s listings (UI + Firestore denied)
- [ ] Account A: edit own listing — changes visible to B after refresh
- [ ] Account A: delete own listing — removed for B after refresh

## Images (offers only)

- [ ] Upload JPEG/PNG/WebP ≤ 2 MB — succeeds
- [ ] Image URL loads on detail and card for both accounts
- [ ] File > 2 MB or wrong type — client rejects before upload
- [ ] Request listing — no Storage write; `imageUrls` empty

## Permissions

- [ ] Unauthenticated user cannot create/update/delete listings
- [ ] Authenticated user cannot update/delete another user’s listing

## Regression (local mode — optional)

- [ ] With `VITE_LISTINGS_BACKEND=local`, app still loads seed + localStorage listings for solo dev

---

# Definition of Done

Dev 1’s final-project work is **done** when all of the following are true:

1. **`firestore.rules`** is syntactically valid, deploys successfully, includes **listings** rules with correct ownership permissions, and allows **guest read** on listings (aligned with Dev 3 routing).
2. **`storage.rules`** exists, deploys successfully, and protects listing image paths per authenticated owner writes.
3. **Two real Firebase accounts** can create, view, edit, and delete their own listings; cannot modify each other’s; shared feed works after refresh.
4. **Offer image upload** stores HTTPS URLs in Firestore via Storage; visible cross-account; requests never upload.
5. **Team demo env** is documented: `VITE_LISTINGS_BACKEND=firestore` required for submission.
6. **No Dev 1 regressions:** `npm run build` passes; listing CRUD changes are minimal and scoped to bugs/rules only.
7. **Handoff note** lists any remaining non-blocking gaps (Storage cleanup on delete, etc.).

---

## Key files (reference)

| File | Role |
|------|------|
| `src/services/listingService.ts` | Public API; backend router |
| `src/services/listingService.firestore.ts` | Firestore CRUD + image wiring |
| `src/services/listingService.dev.ts` | localStorage backend |
| `src/services/storageService.ts` | Firebase Storage upload |
| `src/config/listingsBackend.ts` | `VITE_LISTINGS_BACKEND` selector |
| `firestore.rules` | **Primary Dev 1 deliverable** |
| `storage.rules` | **Primary Dev 1 deliverable** |
| `firebase.json` | Rules + hosting references |

---

*Last updated: June 2026 — regenerated from QA audit and current codebase. Supersedes Sprint 1 task tables that assumed Storage and Firestore CRUD were not yet implemented.*
