# Sprint 1 — Dev 1: Firebase Listings (GameShelf)

**Owner:** Developer 1  
**Sprint length:** 2 weeks  
**App:** GameShelf  
**Current priority:** Listing photos for **Offer** listings  
**Related:** [SPRINT1_OVERVIEW.md](./SPRINT1_OVERVIEW.md) · [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md)

---

## Developer 1 responsibilities

Use this as the top-level checklist:

1. [ ] **Verify Firestore listings CRUD** — all five methods work on live Firestore (`VITE_LISTINGS_BACKEND=firestore`).
2. [ ] **Confirm Offer/Request schema** — Firestore docs match `listingPurpose`, purpose-specific fields, `categories[]`, optional `description`.
3. [ ] **Implement listing photo upload** — Firebase Storage for **Offer** listings only; download URLs in `imageUrls[]`.
4. [ ] **Ensure Request listings never upload/store photos** — always `imageUrls: []`; ignore `imageFiles`.
5. [ ] **Add/update Firestore + Storage rules** — listings collection + `listings/{ownerId}/…` image paths.
6. [ ] **Test across two accounts** — shared feed, ownership enforcement, image read access.
7. [ ] **Document remaining gaps** — handoff notes at end of sprint (section 12).

---

## 1. Sprint goal

Listings are **real shared data** in Firestore using the **Offer / Request** model. **Offer** listings may have **one optional photo** in Firebase Storage. **Request** listings never have photos. Usage stays small to avoid unnecessary cost.

---

## 2. Current status (code audit)

| Area | Status |
|------|--------|
| **UI** — create, edit, feed, detail, filters | **Done** — Offer/Request refactor |
| **`listingPurpose`** / **`requestOptions`** / **`tutorialUrl`** | **Done** — types, mapping, form, display |
| **`categories: string[]`** + **`category`** fallback | **Done** |
| **Description optional** | **Done** — form allows empty; Firestore may store `""` |
| **Request — no photo, no availability UI** | **Done** — form sends `imageFiles: []`; compact cards |
| **Offer — optional photo UI** | **Done** — `ImageUploader` max 1 file, offers only |
| **`listingService.firestore.ts` CRUD** | **Implemented in code** — **not yet verified** on live Firestore by team |
| **`VITE_LISTINGS_BACKEND`** | Default **`local`** — flip after CRUD + Storage tests |
| **`storageService.ts`** | **Stub** — data URLs via `readImageAsDataUrl()`; **not Firebase Storage** |
| **Firestore photo wiring** | **Not done** — create payload hard-codes `imageUrls: []`; update strips `imageFiles` |
| **`firestore.rules` listings** | **Not done** — only `users/{userId}` rules exist |
| **`storage.rules`** | **Missing** — file not in repo |
| **`firebase.json`** | **Missing** |
| **`src/lib/firebase.ts`** | **Ready** — exports `storage` when env is configured |

### Legacy fields (still written internally — keep for compatibility)

| Field | Notes |
|-------|--------|
| `listingType` (`lending` \| `wanted`) | Derived from `listingPurpose`; not the primary model |
| `category` (string) | Equals `categories[0]` when array is set |
| `arrangementType: 'free'` | Normalized to `borrow` on read/write |

---

## 3. Already done (mark complete — do not redo)

### Firestore CRUD (code exists in `listingService.firestore.ts`)

- [x] **`fetchListings()`** — `getDocs` + `mapDocToListing()`
- [x] **`getListingById(id)`** — `getDoc`; returns `undefined` if missing
- [x] **`createListing(input)`** — auth check; `buildFirestoreCreatePayload()`; timestamps
- [x] **`updateListing(id, input)`** — ownership check; `buildFirestoreUpdatePayload()`
- [x] **`deleteListing(id)`** — ownership check; `deleteDoc`

### Schema & mapping

- [x] **`listingPurpose`**: `"offer"` \| `"request"` — `listingMapping.ts`, `mapDocToListing()`
- [x] **`requestOptions`** for requests
- [x] **`arrangementType`** for offers (`rent` \| `trade` \| `borrow`)
- [x] **`tutorialUrl`** for offers (optional https URL)
- [x] **`categories[]`** + **`category`** fallback on read/write
- [x] **Optional description** — not required in `ListingForm` validation
- [x] **Request listings** — no image UI; `imageFiles: []` on submit
- [x] **Offer listings** — optional single photo in form; placeholder in card/detail when empty

### Service errors (Firestore backend)

- [x] `"You must be signed in…"` on create/update/delete without session
- [x] `"You can only edit your own listings"` / delete variant on wrong owner
- [x] `"Listing not found"` on missing doc

### Architecture

- [x] Backend router in `listingService.ts` (`local` \| `firestore`)
- [x] No Firebase imports in pages/components for listings
- [x] `npm run build` passes (last verified during listing UX work)

---

## 4. What remains (Developer 1 focus)

| Priority | Task |
|----------|------|
| **P0** | Implement Firebase Storage in `storageService.ts` |
| **P0** | Wire uploads in `listingService.firestore.ts` create/update (offers only) |
| **P0** | Store **download URLs** in `imageUrls[]`; no base64 in Firestore |
| **P1** | Add Firestore **listings** rules to `firestore.rules` |
| **P1** | Create **storage.rules** (content type + size limits) |
| **P1** | Verify all CRUD + photos with `VITE_LISTINGS_BACKEND=firestore` |
| **P1** | Two-account testing |
| **P2** | `.env.example`, `firebase.json`, Storage cleanup on delete (or document deferral) |
| **P2** | Align client max file size (1–2 MB) with Storage rules |

---

## 5. Priority: Listing photos for Offer listings

**This is Developer 1’s main implementation track.** Request listings must never participate in this flow.

### 5.1 Before coding

- [ ] Confirm **Firebase Storage** is enabled in Firebase Console for the project.
- [ ] Confirm **`VITE_FIREBASE_STORAGE_BUCKET`** is set in `.env` (see `src/lib/firebase.ts`).
- [ ] Confirm **billing / free-tier expectations** with the team (Spark limits vs Blaze if needed).
- [ ] Confirm signed-in users can upload (Firebase Auth working — Dev 3).

### 5.2 Product rules

- [ ] Use Firebase Storage **only for Offer listing photos**.
- [ ] **Do not upload** photos for Request listings.
- [ ] Photo is **optional** — empty `imageUrls: []` is valid; UI shows placeholder.
- [ ] **One image per listing** for Sprint 1 (`ImageUploader` defaults to `maxFiles={1}`).
- [ ] **Allowed types:** jpg, jpeg, png, webp (match `LISTING_IMAGE_ACCEPT` in `src/utils/imageFile.ts`).
- [ ] **Max file size:** 1–2 MB recommended (client + Storage rules); local stub currently allows 5 MB.

### 5.3 Upload path & Firestore field

- [ ] Storage path: `listings/{ownerId}/{listingId}/{safeFilename}`
- [ ] After upload, store Firebase **download URL** in `listing.imageUrls[]` (single URL for Sprint 1).
- [ ] **Do not** store base64 or data URLs in Firestore documents.

### 5.4 Create flow

- [ ] If `listingPurpose === 'request'`: save `imageUrls: []`; skip Storage entirely.
- [ ] If Offer with **no** `imageFiles`: save `imageUrls: []`.
- [ ] If Offer **with** `imageFiles`:
  - Option A: `addDoc` first to get `listingId`, then upload, then `updateDoc` with URL.
  - Option B: generate id client-side (`doc(collection(...))`) then `setDoc` after upload.
  - Pick one approach; document in handoff.
- [ ] Ensure final Firestore doc has HTTPS URL(s), not local blob/data URLs.

### 5.5 Update flow

- [ ] If **no new** `imageFiles` in input: **preserve** existing `imageUrls` from Firestore.
- [ ] If **new** `imageFiles` provided (Offer only): upload to Storage; **replace** `imageUrls` with new download URL.
- [ ] Request listings on update: force `imageUrls: []` (ignore any stray files).

### 5.6 Delete flow

- [ ] Delete Firestore listing document (already implemented).
- [ ] **Either** delete Storage objects under `listings/{ownerId}/{listingId}/` **or** document orphaned-file cleanup as deferred TODO.

### 5.7 Stretch (not required for sprint sign-off)

- [ ] Client-side compress/resize before upload.
- [ ] Delete old Storage file when user replaces image.
- [ ] Multi-image gallery (UI does not target this in Sprint 1).

---

## 6. Implementation guidance

### Where to implement (service layer only)

| File | Responsibility |
|------|----------------|
| **`src/services/storageService.ts`** | Replace stub: `uploadListingImage(file, ownerId, listingId)` → Storage upload → `getDownloadURL()` |
| **`src/services/listingService.firestore.ts`** | Call `storageService` on create/update for offers; pass URLs into Firestore write |
| **`src/utils/listingMapping.ts`** | Update `buildFirestoreCreatePayload` / update helpers if `imageUrls` should be set from service layer instead of hard-coded `[]` |
| **`src/utils/imageFile.ts`** | Optional: lower max size to 1–2 MB to match Storage rules |
| **`src/components/ImageUploader.tsx`** | Touch only if client validation must match Storage rules (types/size messaging) |

### Do **not** implement in

- `ListingForm.tsx`, `ListingCard.tsx`, `ListingDetailPage.tsx`, or other pages/components — they already call `listingService` via context; **no direct Firebase Storage imports in UI**.

### Suggested call flow

```text
ListingForm → ListingsContext → listingService.ts (router)
  → listingService.firestore.ts
       → storageService.uploadListingImage()  [offers with files only]
       → Firestore setDoc / updateDoc with imageUrls: [downloadUrl]
```

### Local backend note

`VITE_LISTINGS_BACKEND=local` may keep the data-URL stub in `storageService.ts` for offline demo. Production path is Firestore + real Storage URLs.

---

## 7. Security rules checklist

### Firestore — listings

Add to `firestore.rules` (coordinate merge with Dev 2/3):

- [ ] Signed-in users can **read** listings.
- [ ] Signed-in users can **create** listings only when `request.resource.data.ownerId == request.auth.uid`.
- [ ] Only **owner** can **update** or **delete** (`resource.data.ownerId == request.auth.uid`).

**Baseline snippet:**

```text
match /listings/{listingId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null
    && request.resource.data.ownerId == request.auth.uid;
  allow update, delete: if request.auth != null
    && resource.data.ownerId == request.auth.uid;
}
```

**Optional stretch** (strict schema — enable only if team wants):

- `listingPurpose in ['offer', 'request']`
- Request writes: `imageUrls.size() == 0`

### Storage — listing images

Create `storage.rules` (file missing today):

- [ ] Signed-in users can **read** objects under `listings/…`.
- [ ] Only **owner** can **write** to `listings/{ownerId}/{listingId}/{fileName}` when `request.auth.uid == ownerId`.
- [ ] **Validate content type** on write, e.g. `request.resource.contentType.matches('image/(jpeg|png|webp)')`.
- [ ] **Enforce max file size** on write, e.g. `request.resource.size < 2 * 1024 * 1024` (2 MB).

**Example snippet:**

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /listings/{ownerId}/{listingId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.auth.uid == ownerId
        && request.resource.size < 2 * 1024 * 1024
        && request.resource.contentType.matches('image/(jpeg|png|webp)');
    }
  }
}
```

- [ ] Publish Firestore + Storage rules (Console or `firebase deploy` when `firebase.json` exists).
- [ ] Two-account test: User B cannot write to User A’s Storage path or edit User A’s listing.

---

## 8. Testing checklist

### Build

- [x] `npm run build` passes (re-run after Storage implementation).

### Offer listings — photos

- [ ] Create **offer without image** — saves; card/detail show placeholder; no Storage object.
- [ ] Create **offer with image** — file appears in Firebase Storage at `listings/{ownerId}/{listingId}/…`.
- [ ] Firestore `imageUrls` contains **HTTPS download URL**, not base64.
- [ ] **Listing card** shows uploaded image (`OfferListingCard` hero).
- [ ] **Listing detail** shows uploaded image.
- [ ] **Refresh** — image still loads from URL.
- [ ] **Edit offer** without selecting new image — **preserves** existing `imageUrls`.
- [ ] **Edit offer** with new image — **replaces** URL; new Storage object (old file cleanup per team decision).

### Request listings — no photos

- [ ] Create **request** — no image field in form; no Storage upload.
- [ ] Firestore doc has `imageUrls: []`.
- [ ] Request card has **no** hero/placeholder photo area (compact layout).

### Firestore CRUD (both purposes)

- [ ] `fetchListings` / `getListingById` / create / update / delete work with `VITE_LISTINGS_BACKEND=firestore`.
- [ ] Docs include `listingPurpose`, `categories`, purpose-specific fields, optional empty `description`.

### Two accounts

- [ ] Account A creates offer (with photo) and request.
- [ ] Account B sees both on feed; can load images.
- [ ] Account B **cannot** edit/delete Account A’s listings or upload to A’s Storage path.

### Firebase Console verification

- [ ] `listings` collection — correct schema, URLs in `imageUrls`.
- [ ] Storage bucket — objects only for offers that had photos.

---

## 9. Listing schema reference (GameShelf)

Primary field: **`listingPurpose`**: `"offer"` | `"request"`.

| Field | Offer | Request |
|-------|-------|---------|
| `listingPurpose` | `"offer"` | `"request"` |
| `listingType` | `"lending"` (legacy) | `"wanted"` (legacy) |
| `arrangementType` | `rent` \| `trade` \| `borrow` | — |
| `requestOptions` | — | ≥1 in UI |
| `categories` / `category` | multi-select + fallback | same |
| `description` | Optional | Optional |
| `imageUrls` | 0–1 photo (Storage URL) | Always `[]` |
| `tutorialUrl` | Optional https | Not used |
| `availability` | Available / Unavailable | Internal; UI: Still looking / Request closed |
| `condition` | Required in UI | Default/hidden |
| `location` | Required in UI | Required in UI |

Mapping: `src/utils/listingMapping.ts`, reads via `mapDocToListing()` in `listingService.ts`.

---

## 10. Step-by-step task list (ordered)

### Part A — Verify existing work

- [ ] Run `VITE_LISTINGS_BACKEND=local` — offer + request CRUD on feed/detail.
- [ ] Run `VITE_LISTINGS_BACKEND=firestore` — verify five CRUD methods against live Firestore (no photos yet).
- [ ] Inspect Firestore Console — doc shape matches section 9.

### Part B — Implement listing photos (section 5)

- [ ] Complete all checkboxes in **§5 Priority: Listing photos for Offer listings**.
- [ ] Complete **§6 Implementation guidance** files.

### Part C — Security rules (section 7)

- [ ] Firestore listings rules published and tested.
- [ ] Storage rules published and tested.

### Part D — Env flip & handoff

- [ ] Keep `local` until CRUD + Storage + two-account tests pass.
- [ ] Flip to `VITE_LISTINGS_BACKEND=firestore`; restart dev server.
- [ ] Add `.env.example` if missing (document backend switch).
- [ ] Fill out **§12 Handoff notes** and **§13 Known gaps**.

### Part E — Stretch

- [ ] Firestore composite indexes if Console prompts.
- [ ] Image compression helper.

---

## 11. Definition of done

- [ ] Firestore CRUD **verified** on live project (all five methods).
- [x] Offer/Request schema supported in app code.
- [ ] Offer photos upload to **Firebase Storage**; `imageUrls[]` holds download URLs.
- [x] Request listings never upload or require photos (UI + service behavior).
- [ ] No base64/data URLs in Firestore listing docs (Firestore backend).
- [ ] Firestore listings rules **published and tested**.
- [ ] Storage rules **published and tested** (type + size).
- [ ] Two-account test passes.
- [ ] Team knows how to set `VITE_LISTINGS_BACKEND=firestore`.
- [x] `listingService.dev.ts` retained until team signs off.
- [ ] Remaining gaps documented in section 13.

---

## 12. Handoff notes (fill in when done)

1. **Env flip:** `VITE_LISTINGS_BACKEND=firestore` + restart.
2. **Photo strategy:** one optional offer photo; Storage path; max size/types; request = no photos.
3. **Create flow:** how listing id is obtained before/after upload.
4. **Delete flow:** Storage cleanup implemented or deferred.
5. **Firestore indexes** created (if any).
6. **Rules deploy method:** Console vs CLI.
7. **Known gaps** for next sprint (gallery, compression, pagination, strict schema rules).

---

## 13. Known gaps / code inconsistencies

| Issue | Current code |
|-------|----------------|
| `buildFirestoreCreatePayload` | Always sets `imageUrls: []` |
| `listingService.firestore.ts` update | Strips `imageFiles`; never uploads |
| `storageService.ts` | Data-URL stub only |
| `firestore.rules` | No `listings` block |
| `storage.rules` / `firebase.json` | Not in repo |
| `.env.example` | Referenced in docs; missing from repo |
| `imageFile.ts` | 5 MB limit vs 1–2 MB target for Storage |
| `FIREBASE_REFERENCE.md` | May still say Storage deferred — update separately when Storage ships |
| Local backend | Stores base64 in `imageUrls` via stub — OK for `local` only |

---

## Files to inspect before implementing

- [x] `src/types/listing.ts`
- [x] `src/services/listingService.ts` + `listingService.firestore.ts` + `listingService.dev.ts`
- [x] `src/services/storageService.ts`
- [x] `src/utils/listingMapping.ts` + `listingNormalize.ts` + helpers/display
- [x] `src/components/ListingForm.tsx` + `ImageUploader.tsx` + `ListingCard.tsx`
- [x] `src/pages/ListingDetailPage.tsx`
- [x] `src/config/firebaseCollections.ts` + `src/lib/firebase.ts`
- [ ] `firestore.rules` — add listings
- [ ] `storage.rules` — create
- [ ] `docs/FIREBASE_REFERENCE.md` — align Storage section after implementation

---

## If confused, check…

- `src/services/listingService.dev.ts` — local behavior reference (includes stub upload path)
- `src/utils/listingMapping.ts` — Firestore write payloads
- [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md) — env vars and listing fields
- Firebase Console → Firestore / Storage → Rules → Simulator
