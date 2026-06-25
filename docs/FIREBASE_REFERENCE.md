# GameShelf — Firebase reference

**Purpose:** Stable reference for architecture boundaries, collection schemas, and environment setup.  
**Not a task list** — for Sprint 1 implementation steps, use the sprint docs below.

---

## Source of truth for implementation

| Need | Document |
|------|----------|
| **Finalized product choices** | [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md) |
| Sprint goals, assignments, acceptance tests | [SPRINT1_OVERVIEW.md](./SPRINT1_OVERVIEW.md) |
| Listings Firestore CRUD, rules, images | [SPRINT1_DEV1_FIREBASE_LISTINGS.md](./SPRINT1_DEV1_FIREBASE_LISTINGS.md) |
| Messaging Firestore persistence | [SPRINT1_DEV2_MESSAGING.md](./SPRINT1_DEV2_MESSAGING.md) |
| Profile, auth, settings, follow | [SPRINT1_DEV3_PROFILE_AUTH.md](./SPRINT1_DEV3_PROFILE_AUTH.md) |
| Routing, layouts, shells | [APP_ARCHITECTURE.md](./APP_ARCHITECTURE.md) |

---

## Architecture layers

```text
UI pages/components (presentation + page orchestration)
  ↓
Contexts (shared app state)
  - AuthContext
  - ListingsContext
  - MessagesContext
  ↓
Services (all backend/data logic lives here)
  - authService
  - userService
  - listingService (+ listingService.firestore.ts / listingService.dev.ts)
  - messageService (+ messageService.dev.ts / messageService.firestore.ts)
  - storageService (listing photos — offers only; see PRODUCT_DECISIONS + Dev 1 sprint doc)
  ↓
Firebase SDK layer
  - src/lib/firebase.ts
  - src/config/firebaseCollections.ts
```

**Rule:** Do not import Firebase SDK in `src/pages/*` or `src/components/*`. Contexts orchestrate services only.

### Allowed Firebase import locations

- `src/lib/firebase.ts`
- `src/services/authService.ts`
- `src/services/userService.ts`
- `src/services/listingService.ts` and `listingService.firestore.ts`
- `src/services/messageService.ts` and `messageService.firestore.ts`
- `src/services/storageService.ts` (listing image uploads — offers only)

---

## Auth session (single listener)

```text
Firebase Auth onAuthStateChanged
  → authService.subscribeToAuthChanges()
       → updates cachedUser (for getCurrentUser() in services)
       → callback → AuthContext setUser()
```

- **UI:** `useAuth()` from `AuthContext`
- **Services:** `getCurrentUser()` from `authService`
- **Do not** add a second `onAuthStateChanged` in context or pages
- **Do not** rewrite `AuthContext` for Sprint 1

After profile edits, use `authService.refreshSessionProfile()` + `AuthContext.refreshProfile()` — not a new listener.

---

## Collection names

Centralized in `src/config/firebaseCollections.ts`:

| Constant | Firestore path |
|----------|----------------|
| `COLLECTIONS.listings` | `listings` |
| `COLLECTIONS.users` | `users` |
| `COLLECTIONS.conversations` | `conversations` |
| `COLLECTIONS.messages` | `messages` (or subcollection under conversations — see Dev 2 sprint doc) |

---

## Data shapes (reference)

### `listings/{listingId}`

Aligned with `src/types/listing.ts`:

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Required |
| `description` | string | Optional in UI; may be empty |
| `imageUrls` | string[] | May be empty in Sprint 1 (no Storage); typically empty for requests |
| `listingPurpose` | `'offer' \| 'request'` | Required — what the user is posting |
| `listingType` | `'lending' \| 'wanted'` | Legacy feed field; `lending` = offer, `wanted` = request |
| `category` | string | Legacy primary category; equals `categories[0]` when `categories` is set |
| `categories` | string[] | Optional multi-select game categories; preferred over single `category` |
| `ownerId` | string | Firebase Auth uid |
| `ownerName` | string | Denormalized display name |
| `createdAt` | Timestamp or epoch millis | Map via `mapDocToListing()` |
| `updatedAt` | Timestamp or epoch millis | |
| `condition` | string | |
| `availability` | `'available' \| 'unavailable'` | Offers: available/unavailable. Requests: maps to “Still looking” / “Request closed” in UI |

Purpose-specific fields:

| Field | Type | When |
|-------|------|------|
| `arrangementType` | `'rent' \| 'trade' \| 'borrow'` | Offer listings — single exchange option |
| `requestOptions` | `('rent' \| 'trade' \| 'borrow')[]` | Request listings — one or more options |
| `tutorialUrl` | string (http/https URL) | Offer listings — optional external video link |

Optional: `pricePerDay`, `price`, `location`, `meetupPreferences`, `image`, `gallery`. Legacy `arrangementType: 'free'` is read as `borrow`.

### `users/{uid}`

Aligned with `src/types/user.ts` (`AuthUser` + `UserProfile`):

| Field | Type | Notes |
|-------|------|-------|
| `email` | string | |
| `username` | string | Min 3 chars on edit |
| `displayName` | string | |
| `avatar` | string | Google photo URL, user-pasted external URL, or empty for initials — **no profile Storage** ([PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md)) |
| `bio` | string | Optional |

Preferences (Sprint 1 — Dev 3): `preferredListingTypes`, `preferredCategories`, `showProfilePhoto`, `showFollowingList` on user doc or settings subdoc.

Follow data (Sprint 1 — Dev 3): `users/{uid}.following: string[]` — see [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md) and [SPRINT1_DEV3_PROFILE_AUTH.md](./SPRINT1_DEV3_PROFILE_AUTH.md).

### `conversations` + `messages`

Detailed Sprint 1 shape: [SPRINT1_DEV2_MESSAGING.md](./SPRINT1_DEV2_MESSAGING.md) § Firestore messaging data shape.

Summary:

- **Conversation:** `participantIds`, `listingId`, `listingTitle`, `lastMessage`, `lastMessageAt`, `createdAt`, `updatedAt`
- **Message:** `senderId`, `text`, `createdAt` (subcollection `conversations/{id}/messages` recommended)

---

## Listings backend switch

Controlled by `VITE_LISTINGS_BACKEND` in `.env`:

| Value | Behavior |
|-------|----------|
| `local` (default) | `listingService.dev.ts` — localStorage + seed |
| `firestore` | `listingService.firestore.ts` only — localStorage listings disabled |

**Sprint 1:** Keep `local` until Dev 1 verifies Firestore CRUD. Do **not** delete `listingService.dev.ts` until the team signs off.

Implementation tasks: [SPRINT1_DEV1_FIREBASE_LISTINGS.md](./SPRINT1_DEV1_FIREBASE_LISTINGS.md).

---

## Environment variables

Create `.env` in the project root (never commit it). Required keys:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Optional — default is local if unset
VITE_LISTINGS_BACKEND=local
```

**Setup steps:**

1. `npm install` (includes `firebase` package)
2. Firebase Console → Project settings → Your apps → copy Web app config into `.env`
3. Restart `npm run dev` after changing `.env`
4. Enable **Authentication** sign-in methods (Email/Password, Google)
5. Create **Firestore Database** and publish rules from `firestore.rules` (coordinate across devs)
6. **Hosting:** Firebase Hosting for production — **Dev 3** implements ([SPRINT1_DEV3_PROFILE_AUTH.md](./SPRINT1_DEV3_PROFILE_AUTH.md))

If `VITE_FIREBASE_API_KEY` is missing, `src/lib/firebase.ts` skips initialization and the app loads without crashing (dev warning in console).

---

## Security rules (overview)

Full rule snippets and test steps live in each dev’s sprint doc. Principles:

| Collection | Read | Write |
|------------|------|-------|
| `listings` | Authenticated users (Sprint 1) | Create when authed; update/delete owner only |
| `users` | Authenticated (adjust for public profiles later) | User writes own `users/{uid}` only |
| `conversations` / `messages` | Participants only | Participants only |

**Firebase Storage:** Used for **optional offer listing photos** only (Dev 1). Profile avatars do **not** use Storage — see [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md).

---

## Realtime listeners

**Sprint 1 default:** fetch on load and after mutations (`getDoc` / `getDocs`). Realtime `onSnapshot` is optional stretch.

Future attachment points (post–Sprint 1):

1. Feed — `ListingsContext` or `listingService` helper
2. Inbox — `messageService` subscription
3. Chat — `messageService.subscribeToMessages(conversationId, cb)`

Never attach listeners directly in UI components.

---

## Pagination and indexes (future)

When queries combine filters + sort, Firebase may require composite indexes, e.g.:

- `listingType` + `createdAt`
- `participantIds` (array-contains) + `lastMessageAt`

Create indexes from Console links in error messages.

---

## Firebase Storage (listing photos)

Per [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md) and [SPRINT1_DEV1_FIREBASE_LISTINGS.md](./SPRINT1_DEV1_FIREBASE_LISTINGS.md):

- **Offer listings:** optional photo upload to Storage; download URL in `imageUrls[]`.
- **Request listings:** no photos; `imageUrls` stays empty.
- **Profile avatars:** Google photo URL, external URL, or initials — **not** Storage uploads.

Path convention: `listings/{ownerId}/{listingId}/{filename}`.

---

## What not to change without team agreement

- GameShelf visual identity / Tailwind styling
- Layout shell architecture ([APP_ARCHITECTURE.md](./APP_ARCHITECTURE.md))
- Public API signatures on `listingService.ts`
- `AuthContext` auth listener pattern
