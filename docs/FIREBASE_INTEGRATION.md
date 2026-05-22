# BoardLink — Firebase integration guide

This document is for the teammate implementing **Firebase** (Auth, Firestore, Storage, and later Messaging). The React UI is already built; your job is to **swap the data layer** without redesigning pages.

**Read this first, then** the inline comments in the files listed in [Key files](#key-files-to-touch).

---

## Architecture (keep this pattern)

```
Pages (Dashboard, CreateListing, Detail, Profile, Inbox)
    ↓ only use hooks / context — never import Firebase directly in pages
ListingsContext  (+ future AuthContext)
    ↓ calls async service functions
src/services/listingService.ts   ← YOU implement Firestore here first
src/services/authService.ts      ← YOU create (login, current user)
src/services/storageService.ts   ← YOU create (game photos)
src/lib/firebase.ts              ← YOU create (initializeApp, exports)
```

**Rule:** UI components keep the same Tailwind classes and JSX. Change **services** and **context**, not card layouts.

---

## Current state (what frontend already did)

| Area | Status | Location |
|------|--------|----------|
| Marketplace feed UI | Done (Phase 1) | `src/components/GameCard.tsx`, `ListingsFeed.tsx` |
| Mock listing data | Done | `src/data/listings.ts` → `mockListings` |
| Listing types | Done | `src/types/listing.ts` |
| Create listing form | Done (local) | `src/pages/CreateListingPage.tsx` |
| Listing detail UI | Done | `src/pages/ListingDetailPage.tsx` |
| Profile UI (static) | Done | `src/pages/ProfilePage.tsx` |
| Inbox UI | Stub only | `src/pages/InboxPage.tsx` |
| Firebase | **Not started** | — |

### Important: dashboard still uses mock data directly

`src/pages/DashboardPage.tsx` imports `mockListings` from `src/data/listings.ts` for Phase 1.

**After Firestore works**, change Dashboard to use `useListings()` from context (same pattern as `CreateListingPage`):

```tsx
const { listings, loading, refreshListings } = useListings()
// filter `listings` with filterListings() — same as today with mockListings
```

`ListingsContext` already calls `listingService.fetchListings()` — once you implement Firestore inside that service, wiring the dashboard to context connects the feed to Firebase.

---

## Setup checklist (Firebase Console)

1. Create a Firebase project (e.g. `boardlink-dev`).
2. Enable **Authentication** (Email/Password or Google — match what the team wants).
3. Create **Firestore** database (start in test mode, then add rules).
4. Enable **Storage** bucket for listing images.
5. Register a **Web app** and copy config values into `.env` (see below).
6. Add teammates as project members in Firebase Console.

---

## Environment variables

Create `.env` in the project root (never commit it). Use `.env.example` as a template:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Vite only exposes variables prefixed with `VITE_`.

---

## Files you should create

| File | Purpose |
|------|---------|
| `src/lib/firebase.ts` | `initializeApp`, export `auth`, `db`, `storage` |
| `src/services/authService.ts` | `signIn`, `signOut`, `onAuthStateChanged`, `getCurrentUserProfile` |
| `src/services/storageService.ts` | `uploadListingImage(file) → downloadURL` |
| `src/context/AuthContext.tsx` | Optional: expose `user`, `loading` to the app |
| `src/config/firebaseCollections.ts` | Collection names: `listings`, `users`, `messages` |

See `src/lib/firebase.ts` in the repo for a commented starter template.

---

## Firestore data model (recommended)

### Collection: `listings`

Document ID: auto-generated or slug; must match `Listing.id` in the app.

| Field | Type | Notes |
|-------|------|--------|
| `title` | string | |
| `category` | string | Strategy, Party, Family, etc. |
| `condition` | string | |
| `arrangementType` | string | `rent` \| `trade` \| `free` |
| `listingMode` | string | `lending` \| `wanted` |
| `pricePerDay` | number? | optional |
| `price` | string | display string, e.g. `$5/day` |
| `description` | string | |
| `location` | string | |
| `meetupPreferences` | string? | |
| `image` | string | Storage download URL |
| `gallery` | string[]? | optional extra image URLs |
| `players` | string? | |
| `playTime` | string? | |
| `ownerId` | string | Firebase Auth uid |
| `ownerName` | string | denormalized for cards |
| `ownerAvatar` | string | denormalized URL |
| `ownerRating` | number | denormalized |
| `createdAt` | timestamp | server timestamp |
| `updatedAt` | timestamp | |

Map Firestore documents ↔ `Listing` type in `listingService.ts` (see `mapDocToListing` TODO in that file).

### Collection: `users` (profiles)

Document ID: Auth `uid`.

| Field | Type |
|-------|------|
| `username` | string |
| `displayName` | string |
| `avatar` | string |
| `rating` | number |
| `reviewCount` | number |
| `bio` | string |
| `createdAt` | timestamp |

### Collection: `conversations` / `messages` (later — Inbox)

Not required for first Firebase milestone. `src/pages/InboxPage.tsx` is a stub. Plan subcollections or a `messages` collection when implementing messaging.

---

## Service layer — what to implement

All functions live in **`src/services/listingService.ts`**. Pages must keep calling these names.

| Function | Current behavior | Your Firestore behavior |
|----------|------------------|-------------------------|
| `fetchListings()` | localStorage → fallback `mockListings` | Query `listings` ordered by `createdAt` desc; map to `Listing[]` |
| `getListingById(id)` | loads from `fetchListings` | `getDoc(listings/{id})` or query by id |
| `createListing(input)` | append to localStorage | Upload image → add doc with `ownerId` from auth |
| `saveListings()` | writes entire array to localStorage | **Remove or repurpose** — prefer single-doc writes, not bulk localStorage |
| `updateListing(id, input)` | not implemented | Optional: add when needed |
| `deleteListing(id)` | not implemented | Optional: add when needed |

Keep functions **async** (`Promise<>`) even if sync today — components already expect that.

### Seed data (optional)

On first run, you may import `mockListings` from `src/data/listings.ts` into Firestore using a one-time script or manual upload. After that, the app should read from Firestore only.

---

## Implementation order (recommended)

### Milestone 1 — Listings (highest priority)

- [ ] `src/lib/firebase.ts` + `.env`
- [ ] `fetchListings` → Firestore
- [ ] `getListingById` → Firestore
- [ ] `createListing` → Firestore + Storage for image
- [ ] Update `DashboardPage` to use `useListings()` instead of `mockListings`
- [ ] Update `ListingDetailPage` to use `getListingById` from service (or context) on load / refresh
- [ ] Remove or gate localStorage in `listingService` (dev fallback only)
- [ ] Firestore security rules: read listings public; create only if `request.auth != null`

### Milestone 2 — Authentication

- [ ] `authService.ts` + `AuthContext`
- [ ] Sign up / sign in UI (new pages or modal — coordinate with team)
- [ ] Wrap routes that need auth (`/listings/new`, edit own listing)
- [ ] `createListing` sets `ownerId` from `auth.currentUser.uid`
- [ ] `ProfilePage` loads `users/{uid}` instead of hardcoded `@boardgame_guru`

### Milestone 3 — Storage & images

- [ ] `storageService.uploadListingImage`
- [ ] Wire file input on `CreateListingPage` (currently decorative upload area)
- [ ] Store URLs in `listing.image` and `listing.gallery`

### Milestone 4 — Inbox / messaging

- [ ] Design `messages` or `conversations` schema
- [ ] `messageService.ts`
- [ ] Replace stub in `InboxPage.tsx`
- [ ] “Message Owner” on listing detail

### Milestone 5 — Polish

- [ ] Firestore indexes for filtered queries (category, `listingMode`, `arrangementType`)
- [ ] Move search/filter to Firestore queries where possible (or keep client-side filter on fetched list for MVP)
- [ ] Error handling + loading states in context
- [ ] Production security rules + Storage rules

---

## Pages — what to change (and what not to)

| Page | File | Your work |
|------|------|-----------|
| Dashboard | `src/pages/DashboardPage.tsx` | Switch `mockListings` → `useListings()`; show `loading` from context |
| Create listing | `src/pages/CreateListingPage.tsx` | Already uses `addListing()`; add image upload + auth check |
| Listing detail | `src/pages/ListingDetailPage.tsx` | Prefer `getListingById` from service on mount; keep `location.state` as optional cache |
| Profile | `src/pages/ProfilePage.tsx` | Load user doc from Firestore; keep `ProfileHeader` markup |
| Inbox | `src/pages/InboxPage.tsx` | Build real UI + `messageService` |
| App shell | `src/App.tsx` | Wrap with `AuthProvider` when ready; optional protected routes |

**Do not redesign:** `GameCard`, `BottomNav`, `Navbar`, `tailwind.config.ts`, `html/` prototypes.

---

## Context files

### `src/context/ListingsContext.tsx`

Already calls `listingService`. You may add:

- Real-time listener: `onSnapshot` on `listings` → `setListings`
- Error state: `error: string | null`
- `refreshListings()` after create (already exists)

### `src/context/AuthContext.tsx` (you create)

Expose:

```ts
user: User | null
loading: boolean
signIn(email, password)
signOut()
```

---

## Security rules (starter — tighten for production)

**Firestore (dev starter):**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /listings/{listingId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
        && request.auth.uid == resource.data.ownerId;
    }
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Storage:** restrict writes to `listings/{userId}/{fileName}` for authenticated users.

---

## Testing checklist

- [ ] `npm run dev` — feed loads from Firestore
- [ ] Click card → detail shows correct listing
- [ ] Create listing → appears on dashboard after refresh
- [ ] Refresh browser → data persists (not just localStorage)
- [ ] Sign out / sign in → only owner can edit/delete (when implemented)
- [ ] `npm run build` passes
- [ ] No Firebase API keys committed to git

---

## Questions / handoff

- **UI reference:** static HTML in `html/` folder (not wired to React).
- **Design tokens:** `tailwind.config.ts` — do not change without team agreement.
- **Mock data:** `src/data/listings.ts` — keep for seeds/tests; app should not depend on it after Milestone 1.

If something is unclear, check the `FIREBASE TODO` comments in the service and page files listed above.
