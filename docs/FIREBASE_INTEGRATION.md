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
- calls `authService` only
- **future**: subscribe/unsubscribe to `onAuthStateChanged` via `authService`

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
- `createdAt`
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

- Firebase SDK bootstrapping is still stubbed (`src/lib/firebase.ts`)
- Auth still localStorage mock (`authService`)
- Listings still localStorage/mock fallback (`listingService`)
- Storage still data-URL fallback (`storageService`)
- Messaging is stub-only (`messageService`, `InboxPage`, `ChatPage`)
- Profile stats/reviews are static UI placeholders (`ProfilePage`)

---

## Codebase audit notes (read before wiring)

### Mock-data coupling found

- `listingService` intentionally imports `mockListings` for dev fallback.
- `CategoryChips` now uses static config (`src/config/listingCategories.ts`) instead of listing mock data.
- `src/data/listings.ts` still contains deprecated helper `getListingById()` for seeds/dev only.

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
```

Then:
1. `npm install firebase`
2. uncomment/implement `src/lib/firebase.ts`
3. implement services in order:
   1) `authService`
   2) `listingService`
   3) `storageService`
   4) `messageService`

---

## Do not change

- BoardLink visual identity / Tailwind aesthetic
- layout shell architecture from `docs/APP_ARCHITECTURE.md`
- page/component responsibility boundaries

If unsure, follow inline `FIREBASE TODO:` comments first, then this document.
