# Sprint 1 — Dev 1: Firebase Listings

**Owner:** Developer 1  
**Sprint length:** 2 weeks  
**Related:** [SPRINT1_OVERVIEW.md](./SPRINT1_OVERVIEW.md) · [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md)

---

## 1. Sprint goal

Make listings **real shared data** in Firestore so any signed-in user sees the same feed after refresh — without using paid Firebase Storage for images.

By sprint end:

- `listingService.firestore.ts` implements full CRUD.
- Listings validate required fields and enforce ownership on update/delete.
- Firestore security rules protect listings.
- Team can flip `VITE_LISTINGS_BACKEND=firestore` after testing.
- Image strategy works on the **free plan** (no Storage uploads in Sprint 1).

---

## 2. Current status

| Area | Status |
|------|--------|
| Firebase Auth | **Done** — sign up, login, logout |
| Listings UI (create, edit, feed, detail) | **Done** — works with local backend |
| `listingService.dev.ts` | **Done** — localStorage + seed |
| `listingService.firestore.ts` | **Partial** — may have started implementation; verify all CRUD paths |
| `VITE_LISTINGS_BACKEND` | Default **`local`** — keep until Firestore CRUD is verified |
| Firebase Storage | **Deferred** — do not implement paid Storage in Sprint 1 |
| Listing images on create | **Optional** in UI — may be empty `imageUrls` |
| `firestore.rules` (listings) | **In progress** — coordinate with Dev 2/3 for full rules file |
| Hosting | **Undecided** — Firebase Hosting vs GitHub Pages/Vercel |

---

## 3. Files to inspect first

Read these **before** writing code:

- [ ] `docs/FIREBASE_REFERENCE.md` — listing schema and mapping rules
- [ ] `docs/APP_ARCHITECTURE.md` — how feed and detail pages load listings
- [ ] `src/services/listingService.ts` — public API + router (`local` \| `firestore`)
- [ ] `src/services/listingService.firestore.ts` — **your main implementation file**
- [ ] `src/services/listingService.dev.ts` — reference for expected behavior
- [ ] `src/config/listingsBackend.ts` — `VITE_LISTINGS_BACKEND` switch
- [ ] `src/types/listing.ts` — `Listing`, `CreateListingInput`, `UpdateListingInput`
- [ ] `src/context/ListingsContext.tsx` — how UI calls the service
- [ ] `src/config/firebaseCollections.ts` — `COLLECTIONS.listings`
- [ ] `src/lib/firebase.ts` — `db`, `isFirebaseConfigured`
- [ ] `src/services/authService.ts` — `getCurrentUser()` for `ownerId` / `ownerName`
- [ ] `src/utils/listingNormalize.ts` — field normalization helpers
- [ ] `src/data/mockListings.seed.ts` — optional manual seed source
- [ ] `firestore.rules` — existing rules (add listings section)

---

## 4. Files this developer owns

| File | Action |
|------|--------|
| `src/services/listingService.firestore.ts` | Implement all Firestore listing CRUD |
| `firestore.rules` | Add/update **listings** rules (coordinate merge with team) |
| `firebase.json` | Optional — rules deploy config |
| `.env.example` | Document `VITE_LISTINGS_BACKEND=local` \| `firestore` |

**Optional (time permitting):**

- Hosting research notes in this file or a short `docs/HOSTING_OPTIONS.md`
- One-time seed from `mockListings.seed.ts` (manual Console import or script)

---

## 5. Files to avoid touching

| File | Why |
|------|-----|
| `src/context/AuthContext.tsx` | Dev 3 — single auth listener |
| `src/services/authService.ts` | Dev 3 — except you may **call** `getCurrentUser()` |
| `src/services/messageService*.ts` | Dev 2 |
| `src/services/userService.ts` | Dev 3 |
| `src/pages/ProfilePage.tsx`, `EditProfilePage.tsx` | Dev 3 |
| `src/services/listingService.ts` | Do not change public function signatures — only router internals if absolutely needed |
| `src/services/listingService.dev.ts` | Do not delete — fallback until Firestore verified |
| `src/services/storageService.ts` | **Do not implement Firebase Storage** in Sprint 1 |

---

## 6. Step-by-step task list

### Part A — Audit (Day 1)

- [ ] Run app with `VITE_LISTINGS_BACKEND=local` — confirm create/edit/delete/feed still work.
- [ ] Read `listingService.ts` and list which methods delegate to `firestore` vs `dev`.
- [ ] Open Firebase Console → Firestore — note whether `listings` collection exists and sample doc shape.
- [ ] Confirm `.env` has all `VITE_FIREBASE_*` keys (ask teammate with `.env` — never commit `.env`).

### Part B — Implement Firestore CRUD

Implement in `src/services/listingService.firestore.ts`:

- [ ] **`fetchListings()`** — query `COLLECTIONS.listings`, map each doc with `mapDocToListing()`, sort by `createdAt` desc (client or `orderBy` + index).
- [ ] **`getListingById(id)`** — `getDoc` on `listings/{id}`, return `undefined` if missing.
- [ ] **`createListing(input)`** — use `getCurrentUser()` for `ownerId` / `ownerName`; validate required fields; `addDoc` or `setDoc` with `serverTimestamp()` for `createdAt` / `updatedAt`.
- [ ] **`updateListing(id, input)`** — verify `existing.ownerId === getCurrentUser().id`; merge allowed fields; bump `updatedAt`.
- [ ] **`deleteListing(id)`** — verify ownership; `deleteDoc`.

**Implementation notes:**

- Use `COLLECTIONS.listings` from `src/config/firebaseCollections.ts`.
- Use `mapDocToListing()` from `listingService.ts` (or shared util) — **do not duplicate** mapping logic in pages.
- Map Firestore `Timestamp` → epoch millis for `createdAt` / `updatedAt` if UI expects numbers.
- **Do not** call Firebase from `ListingsContext` or pages — only from this service file.

### Part C — Validation

- [ ] Reject create/update when **title** or **description** is empty (trim whitespace).
- [ ] Require **listingType** (`lending` \| `wanted`).
- [ ] Require **ownerId** on create (from `getCurrentUser()` — throw if not signed in).
- [ ] Throw clear errors: `"You must be signed in"`, `"You can only edit your own listings"`, `"Listing not found"`.

### Part D — Images without Firebase Storage

- [ ] **Do not** implement Firebase Storage uploads in Sprint 1.
- [ ] On create/update, persist `imageUrls` using a **free-safe** approach (pick one or combine):

  | Option | When to use |
  |--------|-------------|
  | **Empty array + UI placeholder** | No image uploaded — feed/detail already show gray placeholder |
  | **External image URL field** | User pastes `https://…` URL in form (may need small form addition) |
  | **Data URL fallback (dev only)** | Existing `storageService` stub returns base64 — OK for **demo/limit**, not for production scale |

- [ ] Document chosen approach in **Handoff notes** (section 11).
- [ ] If `imageFiles` are passed but Storage is off, either ignore files and keep `imageUrls: []` or map to data URL via existing stub — **team decision**, document it.

### Part E — Environment flip (Week 2)

- [ ] Keep `VITE_LISTINGS_BACKEND=local` in `.env` until all CRUD tests pass.
- [ ] Clear `boardlink_listings` from browser localStorage when testing Firestore (DevTools → Application → Local Storage).
- [ ] Set `VITE_LISTINGS_BACKEND=firestore` in `.env` — restart `npm run dev`.
- [ ] Re-run full test checklist (section 9).
- [ ] Update `.env.example` with comment explaining the switch.

### Part F — Security rules

- [ ] Add listings rules to `firestore.rules` (coordinate with Dev 2/3):

```text
match /listings/{listingId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null
    && request.resource.data.ownerId == request.auth.uid;
  allow update, delete: if request.auth != null
    && resource.data.ownerId == request.auth.uid;
}
```

- [ ] Publish rules in Firebase Console (or `firebase deploy --only firestore:rules`).
- [ ] Test denied write: User B cannot edit User A’s listing.

### Part G — Hosting research (stretch)

- [ ] Compare **Firebase Hosting** vs **GitHub Pages** vs **Vercel** for this Vite SPA.
- [ ] Note: env vars, PWA, custom domain, team familiarity.
- [ ] Write 5–10 bullet recommendation in handoff — **decision can wait** until after listings work.

---

## 7. Image strategy for free plan

**Decision for Sprint 1: no Firebase Storage.**

| Approach | Pros | Cons |
|----------|------|------|
| Placeholder when `imageUrls` empty | Zero cost, already in UI | Less visual appeal |
| External URL in `imageUrls[]` | Real images, free | User must host image elsewhere; validate URL format |
| Data URL via dev stub | Works offline demo | Large Firestore docs; bad for production |

**Recommended MVP:** placeholder + optional **image URL** field on create/edit form (small UI addition). Dev 1 can propose; Dev 3 may help with form copy.

---

## 8. Security rules checklist

- [ ] Signed-in users can **read** all listings.
- [ ] Signed-in users can **create** listings only with their own `ownerId`.
- [ ] Only **owner** can **update** or **delete** their listing.
- [ ] Rules published to Firebase Console.
- [ ] Tested with two different accounts.

---

## 9. How to test

### Solo (one account)

- [ ] `npm run build` passes.
- [ ] `VITE_LISTINGS_BACKEND=firestore` — create listing → appears on feed.
- [ ] Refresh browser — listing still there.
- [ ] Edit listing — changes persist.
- [ ] Delete listing — removed from feed.
- [ ] Create listing **without image** — feed shows placeholder, no crash.

### Two accounts (required before sprint sign-off)

- [ ] Account A creates listing.
- [ ] Account B (different browser/incognito) sees Account A’s listing on feed.
- [ ] Account B cannot edit/delete Account A’s listing (error or permission denied).
- [ ] Account A can edit/delete own listing.

### Firebase Console

- [ ] `listings` collection shows documents with expected fields: `title`, `description`, `ownerId`, `listingType`, `imageUrls`, timestamps.

---

## 10. Definition of done

- [ ] All five methods in `listingService.firestore.ts` work: `fetchListings`, `getListingById`, `createListing`, `updateListing`, `deleteListing`.
- [ ] Uses `COLLECTIONS.listings`, `getCurrentUser()`, `mapDocToListing()`, Firestore timestamps.
- [ ] `VITE_LISTINGS_BACKEND=firestore` tested; team knows how to flip the env var.
- [ ] Listing validation for title, description, listing type, owner.
- [ ] Listings security rules in place and tested.
- [ ] No Firebase Storage implementation added.
- [ ] Listings work across two accounts/browsers.
- [ ] `listingService.dev.ts` still present (not deleted).
- [ ] No Firebase imports added to pages/components.

---

## 11. Handoff notes

When finished, tell the team:

1. **Env flip:** exact `.env` line for Firestore listings.
2. **Image strategy:** what happens when user uploads a file vs leaves image empty vs pastes URL.
3. **Firestore index:** any composite indexes Firebase Console prompted you to create.
4. **Seed data:** whether mock listings were imported and how.
5. **Hosting recommendation** (if researched).
6. **Known gaps** for Sprint 2 (e.g. Storage, image CDN, pagination).

---

## If confused, check…

- [SPRINT1_OVERVIEW.md](./SPRINT1_OVERVIEW.md) — who owns what files
- `src/services/listingService.dev.ts` — expected behavior mirror
- `src/types/listing.ts` — required fields
- [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md) — `listings` schema
- Firebase Console → Firestore → Rules → Simulator
