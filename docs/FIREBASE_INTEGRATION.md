# BoardLink — Firebase integration guide

This document is for the teammate implementing **Firebase** (Auth, Firestore, Storage, and later Messaging). The React UI is already built; your job is to **swap the data layer** without redesigning pages.

**Read this first, then** the inline comments in the files listed in [Key files](#key-files-to-touch).

---

## Architecture (keep this pattern)

```
Pages (Dashboard, CreateListing, Detail, Profile, Inbox)
    ↓ only use hooks / context — never import Firebase directly in pages
ListingsContext + AuthContext
    ↓ calls async service functions only
src/services/listingService.ts   ← YOU implement Firestore here first
src/services/authService.ts      ← YOU replace mock login/signup/logout/getCurrentUser
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
| Create listing form | Done (localStorage + image preview) | `src/pages/CreateListingPage.tsx`, `src/utils/imageFile.ts` |
| Listing detail UI | Done | `src/pages/ListingDetailPage.tsx` |
| Profile UI | Done (uses AuthContext user + logout) | `src/pages/ProfilePage.tsx` |
| Auth UI (login/signup/splash) | Done (mock service) | `src/pages/LoginPage.tsx`, `SignupPage.tsx`, `AuthSplashPage.tsx` |
| Auth routing | Done | `src/components/AuthGate.tsx`, `App.tsx` |
| Inbox UI | Stub only | `src/pages/InboxPage.tsx` |
| Firebase SDK | **Not started** | `src/lib/firebase.ts` stubs only |

### Dashboard and create flow (frontend — no Firebase yet)

- **Dashboard** uses `useListings()` → `listingService.fetchListings()` (localStorage, else `mockListings`).
- **Create listing** saves via `listingService.createListing()`; images are **data URLs** in localStorage until Storage (see `src/utils/imageFile.ts`).
- **Detail page** resolves listings from `ListingsContext` (includes user-created posts).

**Your Firestore work:** replace implementations in `listingService.ts` only; pages should keep calling context/services. Remove base64 image blobs from Firestore docs — store Storage URLs in `listing.image`.

### Authentication (frontend wired — mock persistence)

- **Login / signup pages** call `useAuth()` → `authService.login|signup|logout|getCurrentUser()` (no Firebase in pages).
- **Protected routes:** dashboard, inbox, create listing, profile, listing detail (`ProtectedRoute` in `src/components/AuthGate.tsx`).
- **Guest routes:** `/login`, `/signup` redirect to `/` when already signed in (`GuestRoute`).
- **Splash:** `AuthSplashPage` while `AuthContext` restores session on load.
- **Logout:** Profile → Account section → `logout()` → `/login`.
- **Mock persistence:** `localStorage` keys `boardlink_auth_session` + `boardlink_auth_users` (dev only — remove when Firebase Auth is live).

---

## Authentication — Firebase implementation guide

### Service functions to implement (`src/services/authService.ts`)

| Function | Current (mock) | Firebase replacement |
|----------|----------------|----------------------|
| `login(email, password)` | Read `boardlink_auth_users`, set session | `signInWithEmailAndPassword(auth, email, password)` → load profile |
| `signup(email, password, username)` | Append mock user + session | `createUserWithEmailAndPassword` + `setDoc(users/{uid}, { username, ... })` |
| `logout()` | `removeItem(boardlink_auth_session)` | `signOut(auth)` |
| `getCurrentUser()` | Read session + mock users table | `auth.currentUser` or `onAuthStateChanged` + optional Firestore `users/{uid}` |

**Do not rename these exports** — `AuthContext` and pages depend on them.

### Expected `AuthUser` shape (`src/types/user.ts`)

```ts
{
  id: string          // Firebase Auth uid
  email: string
  username: string    // handle without @
  displayName: string
  avatar: string      // URL (Storage or default)
}
```

Map from Firebase Auth `User` + Firestore `users/{uid}` document. Keep fields stable so `ProfileHeader` and listing owner denormalization do not need UI changes.

### Where auth persistence is handled

| Layer | Mock (now) | Production (your work) |
|-------|------------|-------------------------|
| Session | `localStorage` key `boardlink_auth_session` | Firebase Auth browser persistence (automatic) |
| User profile | `localStorage` key `boardlink_auth_users` | Firestore collection `users` |
| App restore | `AuthContext` `useEffect` → `getCurrentUser()` | `onAuthStateChanged` in `AuthContext` (see FIREBASE TODO there) |
| Route guards | `ProtectedRoute` / `GuestRoute` | **No change** — still use `useAuth().user` |

### Environment variables & files required

Same as core Firebase setup (`.env.example`):

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Also required:

- `npm install firebase`
- `src/lib/firebase.ts` — export `auth` from `getAuth(app)`
- Firebase Console → **Authentication** → enable **Email/Password**
- Firestore `users` collection (see data model below)

### AuthContext (`src/context/AuthContext.tsx`)

Replace session restore `useEffect` with:

```ts
onAuthStateChanged(auth, async (firebaseUser) => {
  if (!firebaseUser) { setUser(null); setLoading(false); return }
  const profile = await /* getDoc users/{uid} or cache */
  setUser(mapToAuthUser(firebaseUser, profile))
  setLoading(false)
})
```

Pages keep using `login`, `signup`, `logout` from context — implement those by calling updated `authService` only.

### Route protection (`src/components/AuthGate.tsx`)

No structural changes expected. Guards read `useAuth().user` and `loading` from context.

### Listing owner linkage

`listingService.buildListing` already calls `getCurrentUser()` for owner name/avatar.

**FIREBASE TODO:** add `ownerId: currentUser.id` on Firestore documents when `createListing` uses `addDoc`.

### Firestore `users` document (profile)

Document ID: Auth `uid`.

| Field | Type |
|-------|------|
| `username` | string |
| `displayName` | string |
| `avatar` | string |
| `email` | string |
| `rating` | number (optional) |
| `reviewCount` | number (optional) |
| `bio` | string (optional) |
| `createdAt` | timestamp |

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
| `description` | string | |
| `category` | string | Strategy, Party, Family, etc. |
| `condition` | string | |
| `availability` | string | `available` \| `unavailable` |
| `listingType` | string | `lending` \| `wanted` |
| `imageUrls` | string[] | Storage download URLs (at least 1) |
| `ownerId` | string | Firebase Auth uid |
| `ownerName` | string | denormalized for cards |
| `createdAt` | timestamp | server timestamp |
| `updatedAt` | timestamp | optional |

Optional legacy fields (if you keep the old UI badges):

| Field | Type | Notes |
|-------|------|--------|
| `arrangementType` | string | `rent` \| `trade` \| `free` |
| `pricePerDay` | number? | optional |
| `price` | string? | optional display string |
| `location` | string? | optional |
| `meetupPreferences` | string? | optional |

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
| `updateListing(id, input)` | updates localStorage | `updateDoc` (owner-only) |
| `deleteListing(id)` | deletes from localStorage | `deleteDoc` (owner-only) |

Keep functions **async** (`Promise<>`) even if sync today — components already expect that.

### Where realtime listeners may attach (later)

- `src/context/ListingsContext.tsx`: `refreshListings()` is the single place to swap from a one-time fetch to a realtime `onSnapshot` listener.
- Detail page: optional per-document `onSnapshot(doc(db,'listings',id))` for live availability.

### Pagination opportunities (future scaling)

- `fetchListings()` can accept `{ limit, startAfter }` and return `{ listings, nextCursor }`.
- Firestore: `query(listings, orderBy('createdAt','desc'), limit(n))` and `startAfter(lastDoc)`.

### Storage upload expectations

Current frontend calls `storageService.uploadListingImage(file, userId, listingId)` and expects a **public URL** string.

FIREBASE TODO:
- Path: `listings/{userId}/{listingId}/{filename}`
- Return: `getDownloadURL(ref)`

### Seed data (optional)

On first run, you may import `mockListings` from `src/data/listings.ts` into Firestore using a one-time script or manual upload. After that, the app should read from Firestore only.

---

## Implementation order (recommended)

### Milestone 1 — Listings (highest priority)

- [ ] `src/lib/firebase.ts` + `.env`
- [ ] `fetchListings` → Firestore
- [ ] `getListingById` → Firestore
- [ ] `createListing` → Firestore + Storage for image
- [x] ~~Update `DashboardPage` to use `useListings()`~~ (done — feed uses context)
- [ ] Update `ListingDetailPage` to use `getListingById` from service (or context) on load / refresh
- [ ] Remove or gate localStorage in `listingService` (dev fallback only)
- [ ] Firestore security rules: read listings public; create only if `request.auth != null`

### Milestone 2 — Authentication

- [x] ~~Sign up / sign in UI~~ (`LoginPage`, `SignupPage`)
- [x] ~~`AuthContext` + `useAuth`~~
- [x] ~~Protected / guest routes~~ (`AuthGate`, `ProtectedRoute`, `GuestRoute`)
- [ ] Replace mock `authService` with Firebase Auth (`login`, `signup`, `logout`, `getCurrentUser`)
- [ ] `onAuthStateChanged` in `AuthContext` (remove mock localStorage restore)
- [ ] `createListing` sets `ownerId` from `auth.currentUser.uid` in Firestore
- [ ] `ProfilePage` / `ProfileHeader` load extended fields from Firestore `users/{uid}` (optional bio, stats)

### Milestone 3 — Storage & images

- [ ] `storageService.uploadListingImage`
- [ ] Replace data URL upload on `CreateListingPage` with `storageService.uploadListingImage` (file input UI already exists)
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
| Dashboard | `src/pages/DashboardPage.tsx` | Uses `useListings()` — no change if service returns Firestore data |
| Create listing | `src/pages/CreateListingPage.tsx` | Swap `readImageAsDataUrl` → `storageService`; route already protected |
| Listing detail | `src/pages/ListingDetailPage.tsx` | Optional async `listingService.getListingById` on mount; keep `location.state` cache |
| Profile | `src/pages/ProfilePage.tsx` | Load user doc from Firestore; keep `ProfileHeader` markup |
| Inbox | `src/pages/InboxPage.tsx` | Build real UI + `messageService` |
| Login / Signup | `src/pages/LoginPage.tsx`, `SignupPage.tsx` | No UI change; wire errors from Firebase Auth codes |
| App shell | `src/App.tsx` | AuthProvider in place; no route restructure needed |

**Do not redesign:** `GameCard`, `BottomNav`, `Navbar`, `tailwind.config.ts`, `html/` prototypes.

---

## Context files

### `src/context/ListingsContext.tsx`

Already calls `listingService`. You may add:

- Real-time listener: `onSnapshot` on `listings` → `setListings`
- Error state: `error: string | null`
- `refreshListings()` after create (already exists)

### `src/context/AuthContext.tsx` (implemented — swap service backend)

Exposes:

```ts
user: AuthUser | null
loading: boolean   // true during initial getCurrentUser / onAuthStateChanged
login(email, password)
signup(email, password, username)
logout()
```

Pages use `useAuth()` only — never import Firebase here.

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

- [ ] `npm run dev` — signed-out users land on `/login`; after signup, dashboard loads
- [ ] Logout returns to login; refresh keeps session (Firebase) or mock localStorage
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
