# TODO — Firebase Backend (Listings + Storage + Rules)

**Owner:** Firebase / backend teammate  
**Related doc:** `docs/FIREBASE_INTEGRATION.md`  
**Do not overlap with:** `docs/TODO_MESSAGING_PROFILE.md` (messaging + profile UI)

---

## 1. Purpose

Wire BoardLink’s **shared backend** so listings and images work for all users — not just in one browser’s localStorage.

You own:

- Firestore listings CRUD
- Firebase Storage image uploads
- Security rules (Firestore + Storage)
- Backend environment / flip from local to Firestore

The React UI is already built. Your job is to implement the **service layer** so existing pages keep working without rewrites.

---

## 2. Current status

| Area | Status |
|------|--------|
| Firebase Auth | **Done** — login, signup, logout |
| Firestore user profiles on signup | **Partial** — `users/{uid}` written on signup |
| Listings UI + local CRUD | **Done** — works via `listingService.dev.ts` + localStorage |
| `listingService.firestore.ts` | **Stub only** — all methods throw |
| `storageService.ts` | **Dev stub** — returns base64 data URLs |
| `VITE_LISTINGS_BACKEND` | Defaults to `local` when unset in `.env` |
| Security rules | **Not started** — no `firestore.rules` or `firebase.json` in repo |

---

## 3. Files to inspect first

Read these before changing anything:

- [ ] `docs/FIREBASE_INTEGRATION.md` — architecture rules and schema
- [ ] `src/services/listingService.ts` — public API + router (local vs firestore)
- [ ] `src/services/listingService.firestore.ts` — **your main implementation file**
- [ ] `src/services/listingService.dev.ts` — current local backend (reference only)
- [ ] `src/services/storageService.ts` — image upload stub
- [ ] `src/types/listing.ts` — `Listing` shape (`imageUrls`, `ownerId`, `updatedAt`, etc.)
- [ ] `src/config/listingsBackend.ts` — `VITE_LISTINGS_BACKEND` switch
- [ ] `src/config/firebaseCollections.ts` — `COLLECTIONS.listings`
- [ ] `src/lib/firebase.ts` — `auth`, `db`, `storage`, `isFirebaseConfigured`
- [ ] `src/services/authService.ts` — use `getCurrentUser()` for `ownerId` / `ownerName`
- [ ] `src/data/mockListings.seed.ts` — optional one-time Firestore seed source

---

## 4. Files this teammate owns

You should create or edit **only** these (unless coordinating a small router change):

| File | Action |
|------|--------|
| `src/services/listingService.firestore.ts` | Implement all Firestore listing CRUD |
| `src/services/storageService.ts` | Implement Firebase Storage uploads |
| `firestore.rules` | Create Firestore security rules |
| `storage.rules` | Create Storage security rules |
| `firebase.json` | Create Firebase project config (rules deploy) |
| `.env` / `.env.example` | Document `VITE_LISTINGS_BACKEND` when ready |

Optional:

- [ ] One-time seed script or manual import from `mockListings.seed.ts`
- [ ] Short notes in `docs/FIREBASE_INTEGRATION.md` if behavior changes

---

## 5. Files to avoid editing

**Do not touch** without team agreement:

| File | Why |
|------|-----|
| `src/context/AuthContext.tsx` | Auth listener already unified — do not add a second listener |
| `src/services/authService.ts` | Owned by auth/profile teammate (except emergency fixes) |
| `src/pages/*` | No Firebase in pages — UI should not change for listings backend |
| `src/components/*` | Same — keep Firebase out of components |
| `src/services/messageService*.ts` | Owned by messaging teammate |
| `src/context/MessagesContext.tsx` | Messaging teammate |
| `src/services/listingService.dev.ts` | Keep until Firestore is verified; then delete |
| `listingService.ts` **public API** | Do not rename/remove exports: `fetchListings`, `getListingById`, `createListing`, `updateListing`, `deleteListing`, `mapDocToListing` |

**Router changes in `listingService.ts`:** Only if required for Firestore wiring. Do not duplicate local CRUD logic there — local path stays in `.dev.ts`, Firestore path in `.firestore.ts`.

---

## 6. Step-by-step task list

### Phase A — Understand the router

- [ ] Review how `listingService.ts` chooses backend:
  - `isFirestoreListingsBackend()` from `src/config/listingsBackend.ts`
  - `local` → `listingService.dev.ts`
  - `firestore` → `listingService.firestore.ts`
- [ ] Confirm `.env` has Firebase keys (`VITE_FIREBASE_*`) from Firebase Console
- [ ] Keep `VITE_LISTINGS_BACKEND=local` (or unset) until Phase D testing passes

### Phase B — Implement `listingService.firestore.ts`

Implement each exported function. Use existing helpers — do not reinvent types.

- [ ] **`fetchListings`**
  - Query `collection(db, COLLECTIONS.listings)`
  - Order by `createdAt` or `updatedAt` desc (add composite index if needed)
  - Map each doc with `mapDocToListing(doc.id, doc.data())` from `listingService.ts`

- [ ] **`getListingById`**
  - `getDoc(doc(db, COLLECTIONS.listings, id))`
  - Return `undefined` if missing
  - Map with `mapDocToListing`

- [ ] **`createListing`**
  - Require `getCurrentUser()` — throw if not signed in
  - Upload images via `storageService.uploadListingImage` **before** writing doc
  - Use `addDoc` or `setDoc` with generated id
  - Set fields per `src/types/listing.ts`: `title`, `description`, `imageUrls`, `listingType`, `category`, `ownerId`, `ownerName`, `condition`, `availability`, optional `arrangementType`, `price`, `pricePerDay`, `location`, `meetupPreferences`
  - Use `serverTimestamp()` for `createdAt` and `updatedAt` in Firestore; `mapDocToListing` converts to millis for the app

- [ ] **`updateListing`**
  - Verify `existing.ownerId === getCurrentUser().id`
  - If `input.imageFiles` provided, upload new images and replace `imageUrls`
  - `updateDoc` with changed fields + `updatedAt: serverTimestamp()`

- [ ] **`deleteListing`**
  - Verify ownership
  - `deleteDoc` on listing
  - Optional: delete Storage files under `listings/{userId}/{listingId}/`

**Imports to use:**

```ts
import { db, storage } from '../lib/firebase'
import { COLLECTIONS } from '../config/firebaseCollections'
import { getCurrentUser } from './authService'
import { mapDocToListing } from './listingService' // or colocate mapper import
import * as storageService from './storageService'
```

### Phase C — Implement Firebase Storage in `storageService.ts`

- [ ] Replace data-URL fallback with real upload
- [ ] Path pattern: `listings/{userId}/{listingId}/{filename}`
- [ ] Use `ref(storage, path)` + `uploadBytes` + `getDownloadURL`
- [ ] Return the **download URL string** (not base64)
- [ ] Ensure `listingService` stores returned URLs in `imageUrls[]` on the Firestore doc

Example shape:

```ts
export async function uploadListingImage(
  file: File,
  userId: string,
  listingId?: string,
): Promise<string> {
  // upload to Storage → return getDownloadURL(ref)
}
```

### Phase D — Test locally before flipping backend

- [ ] Keep `VITE_LISTINGS_BACKEND=local` during development
- [ ] Implement Firestore functions and test by temporarily calling them from a dev script or by flipping env **only on your machine**
- [ ] Clear stale local data when testing Firestore:
  - DevTools → Application → Local Storage → delete `boardlink_listings`
  - Or run `devClearListingsStorage()` from `listingService.dev.ts` in console
- [ ] When CRUD + images work: set `VITE_LISTINGS_BACKEND=firestore` in `.env`
- [ ] Restart dev server (`npm run dev`) after env change

### Phase E — Security rules

- [ ] Add `firebase.json` pointing to rules files
- [ ] **Firestore `listings`:**
  - [ ] Read: authenticated users (or public read — team decision; document choice)
  - [ ] Create: authenticated, `request.auth.uid == request.resource.data.ownerId`
  - [ ] Update/delete: `request.auth.uid == resource.data.ownerId`
- [ ] **Firestore `users`:**
  - [ ] Read: authenticated (or public profile fields only)
  - [ ] Write: `request.auth.uid == userId`
- [ ] **Storage `listings/{userId}/...`:**
  - [ ] Write: `request.auth.uid == userId`
  - [ ] Read: authenticated or public (match product needs)
- [ ] Deploy rules: `firebase deploy --only firestore:rules,storage` (requires Firebase CLI login)

### Phase F — Seed data (optional)

- [ ] Import `mockListings.seed.ts` into Firestore once for demo listings
- [ ] Replace seed `ownerId` values with real Firebase uids if needed

---

## 7. Testing checklist

Run while signed in with two different test accounts if possible.

- [ ] **Create** — new listing appears on home feed after refresh
- [ ] **Read** — feed loads from Firestore (not localStorage)
- [ ] **Read one** — listing detail page loads by id
- [ ] **Update** — edit listing; changes persist after refresh
- [ ] **Delete** — listing removed from feed after refresh
- [ ] **Images** — uploaded image shows after refresh (URL is `https://firebasestorage...`, not `data:image/...`)
- [ ] **Ownership** — user B cannot edit/delete user A’s listing (UI error + rules block)
- [ ] **Env switch** — with `VITE_LISTINGS_BACKEND=firestore`, localStorage listings are **not** shown
- [ ] **Env guard** — with `firestore` set, `listingService.dev.ts` is never used for reads/writes

---

## 8. Definition of done

- [ ] All five functions in `listingService.firestore.ts` implemented and working
- [ ] `storageService.uploadListingImage` returns Firebase Storage download URLs
- [ ] `imageUrls` on Firestore listing docs contain Storage URLs only
- [ ] `VITE_LISTINGS_BACKEND=firestore` works for the team with shared `.env` guidance
- [ ] Basic Firestore + Storage rules deployed
- [ ] `docs/FIREBASE_INTEGRATION.md` still accurate (update if you changed handoff steps)
- [ ] No Firebase imports added to `src/pages/` or `src/components/`
- [ ] `listingService.dev.ts` still present until team signs off, then can be deleted in a follow-up PR

---

## 9. Warnings / common mistakes

- **Do not flip `VITE_LISTINGS_BACKEND=firestore` before `.firestore.ts` is done** — the app will throw on every listing operation.
- **Do not store base64 data URLs in Firestore** — use Storage + download URLs.
- **Do not import `auth` directly in listing service** — use `getCurrentUser()` from `authService.ts`.
- **Do not skip `updatedAt`** — required on `Listing` type; use `serverTimestamp()` on writes.
- **Do not put Firestore logic in `ListingsContext`** — context calls `listingService` only.
- **localStorage will mask Firestore** if backend is still `local` — always verify env var when debugging.
- **Composite indexes** — Firestore may prompt for an index URL in the console if you filter + order; create it when asked.

---

## 10. Final handoff notes

When finished, tell the team:

1. Exact `.env` values required (especially `VITE_LISTINGS_BACKEND=firestore`)
2. Whether Firestore listings read is public or auth-only
3. Firebase Console index links if any were created
4. How to clear old local data (`boardlink_listings`)
5. That messaging and profile tasks remain in `docs/TODO_MESSAGING_PROFILE.md`

**Merge conflict hotspots:** `listingService.ts`, `storageService.ts`, `.env.example` — coordinate before large PRs.
