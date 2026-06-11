# BoardLink — Firebase integration handoff

This document is for the teammate wiring Firebase into the existing BoardLink frontend.

Goal: connect Firebase quickly **without changing the current UI architecture**.

Do not import Firebase SDK directly in pages/components.

---

## Current architecture (as-built)

```text
UI pages/components (presentation + page orchestration)
  ↓
Contexts (shared app state)
  - AuthContext
  - ListingsContext
  ↓
Services (all backend/data logic lives here)
  - authService
  - listingService
  - storageService
  - messageService (stub)
  ↓
Firebase SDK layer
  - src/lib/firebase.ts
  - src/config/firebaseCollections.ts
```

Related doc: `docs/APP_ARCHITECTURE.md` (routing/layout shell).

---

## Where Firebase SDK logic belongs

### Allowed places for Firebase imports

- `src/lib/firebase.ts`
- `src/services/authService.ts`
- `src/services/listingService.ts`
- `src/services/storageService.ts`
- `src/services/messageService.ts` (stub exists; implement later)

### Not allowed

- `src/pages/*`
- `src/components/*`
- `src/utils/*` (except generic helpers, no SDK calls)
- `src/context/*` should orchestrate service calls only

---

## Service abstraction points (implement here)

### `src/services/authService.ts`

Replace mock localStorage behavior with Firebase Auth + Firestore profile mapping.

Functions used by app:

- `login(email, password)`
- `signup(email, password, username)`
- `logout()`
- `getCurrentUser()`

### `src/services/listingService.ts`

Replace localStorage + `mockListings` fallback with Firestore queries/writes.

Functions used by app:

- `fetchListings()`
- `getListingById(id)`
- `createListing(input)`
- `updateListing(id, input)`
- `deleteListing(id)`

### `src/services/storageService.ts`

Replace data-URL fallback with Firebase Storage upload(s):

- `uploadListingImage(file, userId, listingId?)`

### `src/services/messageService.ts`

Currently stubbed for Milestone 4.
Implement Firestore conversation/message querying + realtime subscriptions there.

---

## Context responsibilities (keep separation)

### `AuthContext`

- owns app-level auth state (`user`, `loading`)
- subscribes to **`authService.subscribeToAuthChanges()`** only (no direct Firebase imports)
- `getCurrentUser()` in services reads the same cached session populated by that listener

### `ListingsContext`

- owns feed state (`listings`, `loading`, `error`, CRUD actions)
- calls `listingService` only
- optional realtime attachment point for feed listener

---

## Collections and data models

Collection names are centralized in `src/config/firebaseCollections.ts`.

### `listings`

Required fields (aligned to `src/types/listing.ts`):

- `id` (doc id)
- `title`
- `description`
- `imageUrls: string[]`
- `listingType: 'lending' | 'wanted'`
- `category`
- `ownerId`
- `ownerName`
- `createdAt` (epoch millis or Firestore Timestamp → millis in `mapDocToListing`)
- `updatedAt`
- `condition`
- `availability: 'available' | 'unavailable'`

Optional legacy fields:
- `arrangementType`
- `pricePerDay`
- `price`
- `location`
- `meetupPreferences`

### `users`

`src/types/user.ts` now distinguishes:

- `AuthUser` (session identity)
- `UserProfile` (extended Firestore profile shape)

Recommended fields:
- `username`, `displayName`, `avatar`, `email`
- `bio`, `rating`, `reviewCount`
- optional score/stats fields used by profile page

### `conversations` + `messages`

Prepared via `src/types/message.ts` and `src/services/messageService.ts`.

Recommended:
- `conversations/{conversationId}`
- `messages/{messageId}` with `conversationId` field, or nested subcollection pattern

---

## Realtime listener attachment points

Use services (or context orchestration) for listeners.

1. Feed realtime:
   - `ListingsContext` effect (or service helper) for `onSnapshot(listings query)`
2. Detail realtime availability:
   - listing-level listener used via `listingService` function
3. Inbox realtime:
   - `messageService.fetchConversations` + subscription helper
4. Chat realtime:
   - `messageService.subscribeToMessages(conversationId, cb)`

Do not create Firestore listeners directly in UI components.

---

## Pagination and scaling opportunities

### Listings feed

Enhance `listingService.fetchListings()` with:
- cursor input (`limit`, `startAfter`)
- typed return with cursor metadata
- server-side filtering by `listingType/category/availability`

### Inbox

Paginate conversations by `lastMessageAt`.

### Chat

Paginate messages by `createdAt`.

### Indexing

Expect composite indexes once query filters combine:
- `listingType + createdAt`
- `category + listingType + createdAt`
- `availability + createdAt`

---

## Security reminders (must-have)

### Firestore

- Listings:
  - read public (or auth-only by product choice)
  - create: authenticated only
  - update/delete: owner-only (`request.auth.uid == resource.data.ownerId`)
- Users:
  - user writes own profile only
- Conversations/messages:
  - only participants can read/write

### Storage

Path convention:
- `listings/{userId}/{listingId}/{filename}`

Rules:
- write only if `request.auth.uid == userId`
- optional size/type restrictions

---

## Known unfinished backend areas

- Auth: Firebase Auth + Firestore user profiles on signup (**done**)
- Listings: local dev backend by default; Firestore stub in `listingService.firestore.ts`
- Storage still data-URL fallback (`storageService`)
- Messaging is stub-only (`messageService`, `InboxPage`, `ChatPage`)
- Profile stats/reviews are static UI placeholders (`ProfilePage`)

---

## Listings backend migration (local → Firestore)

### Backend switch

Controlled by `VITE_LISTINGS_BACKEND` in `.env` (see `.env.example`):

| Value | Behavior |
|-------|----------|
| `local` (default) | `listingService.dev.ts` — localStorage key `boardlink_listings` + seed data |
| `firestore` | `listingService.firestore.ts` only — **localStorage is disabled** |

When `firestore` is set, calling dev/localStorage code throws immediately so Firestore data cannot be masked by stale localStorage.

### Files by role

| File | When to touch |
|------|----------------|
| `src/config/listingsBackend.ts` | Backend selector — do not remove |
| `src/services/listingService.ts` | Public CRUD API — **do not change signatures**; routes to active backend |
| `src/services/listingService.firestore.ts` | **Implement Firestore here** |
| `src/services/listingService.dev.ts` | Delete after Firestore migration verified |
| `src/data/mockListings.seed.ts` | One-time Firestore seed import, then optional delete |
| `src/utils/listingNormalize.ts` | Dev/legacy reads only — not needed for Firestore writes |

### Firestore implementation steps

1. Implement `fetchListings`, `getListingById`, `createListing`, `updateListing`, `deleteListing` in `listingService.firestore.ts`
2. Use `mapDocToListing()` from `listingService.ts` for all reads
3. Use `COLLECTIONS.listings` and `getCurrentUser()` for owner fields
4. Implement `storageService.uploadListingImage` (Firebase Storage URLs)
5. Set `VITE_LISTINGS_BACKEND=firestore` in `.env`
6. Clear stale dev data: `devClearListingsStorage()` from `listingService.dev.ts` (optional)
7. Verify CRUD end-to-end, then delete `listingService.dev.ts`

### Code paths to remove/disable when Firestore is live

- `listingService.dev.ts` — entire file
- `VITE_LISTINGS_BACKEND=local` — switch to `firestore`
- `boardlink_listings` localStorage key — clear in browser or via `devClearListingsStorage()`
- Any direct imports of `mockListings.seed` outside one-time seed scripts

**Do NOT** add Firestore calls alongside dev fallback in the same function — the router in `listingService.ts` already enforces one backend.

---

## Auth architecture (single source of truth)

```text
Firebase Auth onAuthStateChanged
  → authService.subscribeToAuthChanges()
       → updates cachedUser (for getCurrentUser in listingService)
       → callback → AuthContext setUser()
```

- **UI**: `useAuth()` from `AuthContext`
- **Services**: `getCurrentUser()` from `authService` (never import `auth` in listingService)
- **Do not** add a second `onAuthStateChanged` listener in context or pages

---

## Minimizing merge conflicts

High-churn files — coordinate before parallel edits:

| File | Owner guidance |
|------|----------------|
| `listingService.ts` | Listings teammate: keep public API + router; Firestore teammate: implement `.firestore.ts` only |
| `authService.ts` | Auth/Firebase teammate owns; listings work should only use `getCurrentUser()` |
| `types/listing.ts` | Schema changes need both teammates' agreement |
| `FIREBASE_INTEGRATION.md` | Append migration notes; avoid rewriting auth sections another teammate owns |

**Safe parallel work:** Firebase teammate implements `listingService.firestore.ts` + `storageService.ts` without touching `listingService.dev.ts` or `AuthContext`.

---

## Codebase audit notes (read before wiring)

### Listings dev vs production paths

| Layer | File | Role |
|-------|------|------|
| Types | `src/types/listing.ts` | Canonical `Listing` schema |
| Service | `src/services/listingService.ts` | CRUD API + `mapDocToListing` stub |
| Dev fallback | `src/services/listingService.dev.ts` | localStorage + seed reads/writes only |
| Seed data | `src/data/mockListings.seed.ts` | One-time Firestore import source |
| Context | `src/context/ListingsContext.tsx` | Feed state + CRUD orchestration |
| UI config | `src/config/listingCategories.ts` | Category chips / form options |

- Pages/components must **not** import seed data or `listingService.dev`.
- `CategoryChips` and `ListingForm` use `listingCategories` config (not mock listings).
- Legacy `image` / `gallery` fields: normalized via `src/utils/listingNormalize.ts` until Firestore is live.

### Separation-of-concerns status

- No direct Firebase SDK imports in pages/components currently.
- Data/business logic centralized in services.
- Contexts correctly orchestrate shared state via services.
- Messaging interfaces/types now prepared for service-first realtime integration.

---

## Environment setup checklist

Use `.env.example`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_LISTINGS_BACKEND=local
```

Then:
1. `npm install firebase`
2. Copy `.env.example` → `.env` and fill Firebase values
3. Implement services in order:
   1) `listingService.firestore.ts` + set `VITE_LISTINGS_BACKEND=firestore`
   2) `storageService.ts`
   3) `messageService.ts`

---

## Do not change

- BoardLink visual identity / Tailwind aesthetic
- layout shell architecture from `docs/APP_ARCHITECTURE.md`
- page/component responsibility boundaries

If unsure, follow inline `FIREBASE TODO:` comments first, then this document.
