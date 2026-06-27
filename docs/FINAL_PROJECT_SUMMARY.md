# GameShelf — Final Development Summary

**Project:** GameShelf (board game lending, renting, and trading marketplace)  
**Stack:** React 19 · TypeScript · Tailwind CSS 4 · Vite 8 · Firebase 12  
**Sprint:** Sprint 1 (2 weeks, 3 developers)  
**Audience:** Development team and presentation preparation — not end-user documentation  
**Verified against:** source code, git history, sprint docs, and implementation audits (June 2026)

---

# 1. Executive Summary

Over the last two weeks, GameShelf evolved from a UI prototype with mock data into a **structured, Firebase-ready web application** with real authentication, shared user profiles, a redesigned Offer/Request listings model, and a service-layer architecture that keeps Firebase out of the UI.

The sprint goal was to deliver a **usable product foundation**: accounts that persist, profiles and settings stored in Firestore, listings that can be shared across users, messaging flows with working UI, and elimination of dead buttons on core surfaces. The team organized work across three developers (listings/Firestore, messaging, profile/auth/hosting) with shared architecture rules documented in `docs/SPRINT1_OVERVIEW.md` and `docs/PRODUCT_DECISIONS.md`.

**What shipped in code:**

- Full **email/password and Google authentication** with Firestore user profiles
- **Profile editing, settings, preferences**, avatar strategy (Google photo / initials / optional URL), **follow system**, and **password recovery**
- **Offer vs Request** listing redesign across create, feed, cards, and detail views
- **Firestore listings CRUD** and **Firebase Storage image upload** for Offer listings (when `VITE_LISTINGS_BACKEND=firestore`)
- **Messaging UI** with inbox and chat, backed by a **localStorage dev backend** (Firestore messaging not yet implemented)
- **Routing, layouts, and contexts** for tab vs stack navigation, protected routes, and global state
- **Firebase Hosting configuration** (`firebase.json`, `.firebaserc`) and partial security rules

**What remains for a production-ready launch:** Firestore rules for listings and messages, `storage.rules` file (referenced but missing from repo), wiring the **Message Owner** button, flipping the default listings backend to Firestore for team-wide testing, and deploying to Firebase Hosting with authorized domains.

`npm run build` passes as of the final implementation pass.

---

# 2. Major Features Completed

## Authentication

| Feature | Before | What changed | Why it improved the app |
|---------|--------|--------------|-------------------------|
| Email/password sign up & login | Early mock or partial Firebase wiring | `authService.ts` uses Firebase Auth; `AuthContext` exposes `login`, `signup`, `logout` | Users can create real accounts tied to Firebase |
| Google Sign In | Not available | `loginWithGoogle()` with popup; `GoogleAuthButton` on login/signup; first sign-in creates `users/{uid}` | Faster onboarding; Google profile photo available |
| Session management | Inconsistent or mock | Single `subscribeToAuthChanges` listener; `getCurrentUser()` for services; `AuthGate` splash | One source of truth; no duplicate auth listeners |
| Forgot password | Not implemented | `sendPasswordReset()` + Login page forgot-password flow | Email users can recover accounts without support |
| Change password | Not implemented | `changePassword()` with reauthentication; Settings form for email users only | Signed-in users can rotate credentials securely |
| Google password copy | N/A | Settings shows “Password is managed by Google.” for non-email providers | Avoids broken password forms for Google users |
| User profile creation | Manual or missing | Signup and Google first-login write `users/{uid}` in Firestore | Profile data survives refresh and syncs to UI |

**Key files:** `src/services/authService.ts`, `src/context/AuthContext.tsx`, `src/pages/LoginPage.tsx`, `src/pages/SignupPage.tsx`, `src/components/auth/GoogleAuthButton.tsx`

---

## User Profiles

| Feature | Before | What changed | Why it improved the app |
|---------|--------|--------------|-------------------------|
| Profile editing | Static mock profile | `EditProfilePage` + `userService.updateProfile()` for display name, username, bio, avatar URL | Users control their public identity |
| Avatar system | Static placeholder image URL for everyone | `Avatar.tsx` + `avatarDisplay.ts`: image URL, Google photo, or initials | Clear identity without profile Storage costs |
| Initials fallback | N/A | Email signup stores empty `avatar`; legacy default URL treated as empty | Distinct avatars without uploads |
| Preferences | Not persisted | `UserPreferences` on `users/{uid}`: listing types, categories, photo/following visibility | Personalized feed and profile display |
| Settings page | Link only or missing | `/settings` with Account, Password, Profile link, Preferences, Privacy | Central place for account management |
| Following system | Dead Follow button | `following: string[]` on user doc; `FollowButton`; `/profile/following` page | Social discovery without a followers model |
| Profile polish | Dead Message/Follow buttons; fake tabs | Removed non-functional buttons and placeholder tabs on own profile | No silent failures on profile |

**Key files:** `src/services/userService.ts`, `src/pages/ProfilePage.tsx`, `src/pages/EditProfilePage.tsx`, `src/pages/SettingsPage.tsx`, `src/pages/FollowingPage.tsx`, `src/components/Avatar.tsx`, `src/components/FollowButton.tsx`

**Note:** Profile stats and reviews on `ProfilePage` remain **mock/placeholder data** — not loaded from Firestore.

---

## Listings

| Feature | Before | What changed | Why it improved the app |
|---------|--------|--------------|-------------------------|
| Offer/Request model | “Lending/wanted” as primary UX | `listingPurpose: 'offer' \| 'request'` drives form, cards, filters, and detail copy | Clearer mental model for borrowers and lenders |
| Listing creation | Single form for all types | `ListingForm` branches: offers get photo, availability, arrangement; requests get compact options, no photo | Less clutter; purpose-appropriate fields |
| Categories | Single category | Multi-select `categories[]` with legacy `category` fallback | Better discovery and filtering |
| Optional description | Often required | Description optional in validation and UI | Faster listing creation |
| Firebase CRUD | localStorage + seed only | `listingService.firestore.ts`: fetch, get, create, update, delete with ownership checks | Shared listings across accounts/browsers |
| Image upload | Base64 in localStorage | `uploadListingImageFirebase()` wired in Firestore create/update for **offers only**; 2 MB client limit | Real photos in Storage; requests never upload |
| Tutorial videos | Not present | Optional `tutorialUrl` on offers | Helps renters learn game rules |
| Search/filter | Basic feed | Dashboard: search, category chips, Offer/Request toggle, exchange filters | Users find relevant games faster |
| Listing detail | Generic layout | Purpose-specific detail sections; owner card with avatar and Follow; owner edit/delete actions | Richer context before contacting owner |
| Backend switch | Hard-coded local | `VITE_LISTINGS_BACKEND=local \| firestore` router in `listingService.ts` | Safe migration path; dev fallback preserved |

**Key files:** `src/components/ListingForm.tsx`, `src/components/ListingCard.tsx`, `src/pages/ListingDetailPage.tsx`, `src/services/listingService.ts`, `src/services/listingService.firestore.ts`, `src/utils/listingMapping.ts`, `src/utils/listingFilters.ts`

**Default:** `VITE_LISTINGS_BACKEND` defaults to **`local`** — Firestore mode requires env flip and rules verification.

---

## Messaging

| Feature | Before | What changed | Why it improved the app |
|---------|--------|--------------|-------------------------|
| Inbox UI | Missing or static | `InboxPage` with conversation list | Users see message threads in one place |
| Chat UI | Missing or static | `ChatPage` with `ChatWindow`, bubbles, input | Familiar chat experience |
| Message persistence (dev) | None | `messageService.dev.ts` + localStorage keys | Messages survive refresh in dev mode |
| `createConversation` | Threw or missing | `devCreateConversation()` implemented locally | Foundation for starting threads |
| MessagesContext | N/A | Loads conversations/messages; send message API | Pages stay thin; shared inbox state |
| Message Owner button | N/A or unwired | Button **exists** on `ListingDetailPage` but **has no click handler** | UI ready; Firestore wiring still Dev 2 work |
| Firestore messaging | N/A | `messageService.firestore.ts` **does not exist**; router always uses dev backend | Cross-browser messaging not yet live |

**Key files:** `src/services/messageService.ts`, `src/services/messageService.dev.ts`, `src/context/MessagesContext.tsx`, `src/pages/InboxPage.tsx`, `src/pages/ChatPage.tsx`, `src/components/messaging/*`

---

## Firebase

| Area | Before | What changed | Why it improved the app |
|------|--------|--------------|-------------------------|
| Firebase SDK bootstrap | Missing or partial | `src/lib/firebase.ts` initializes Auth, Firestore, Storage when `.env` is set | Graceful dev without keys; full stack when configured |
| Firestore users | Not used | Profile, preferences, following on `users/{uid}` | Shared user data |
| Firestore listings | Not used | Full CRUD implementation in `listingService.firestore.ts` | Shared marketplace data |
| Storage | Not used | `uploadListingImageFirebase()` at `listings/{userId}/{listingId}/` | Scalable image hosting for offers |
| Hosting config | Missing | `firebase.json` (hosting + rules refs), `.firebaserc` placeholder | Ready for `firebase deploy` after project id |
| Security rules | None | `firestore.rules` — users read (authed), write own doc only | Basic user data protection |
| Environment | Ad hoc | `VITE_FIREBASE_*` vars + `VITE_LISTINGS_BACKEND` | Documented configuration pattern |

**Gaps (verified in repo):**

- `firestore.rules` has **duplicate/malformed** `match /users` block outside `service cloud.firestore` — needs cleanup before deploy
- **No `storage.rules` file** despite `firebase.json` referencing it
- **No Firestore rules for `listings`, `conversations`, or `messages`**
- **Hosting deploy** not completed (requires Console + CLI)
- **`.env.example`** not in repository

---

## UI/UX Improvements

| Area | Before | What changed | Why it improved the app |
|------|--------|--------------|-------------------------|
| Navigation | Inconsistent paths | `ROUTES` constants; tab shell (Home, Create, Inbox, Profile) + stack shell (detail, edit, chat, settings) | Predictable navigation patterns |
| Wording | “Lending/wanted” jargon | Offer/Request labels across marketplace | User-friendly language |
| Empty states | Missing | `EmptyState` on feed and inbox | Clear feedback when no data |
| Loading states | Minimal | Skeletons, splash page, loading copy | Perceived performance |
| Responsive layout | Basic | Tailwind utility system; mobile bottom nav; safe-area padding | Usable on phones |
| Button cleanup | Dead Message/Follow on profile | Removed or wired per sprint ownership | Trust in UI actions |
| Accessibility | Partial | Skip link, landmarks (`Page`/`main`), form labels, alert roles | Better baseline a11y |
| PWA | None | Vite PWA plugin with service worker | Installable/offline shell potential |

---

# 3. Architecture Improvements

## Service layer pattern

All backend logic lives in `src/services/*`. Pages and components call services or contexts — **no Firebase imports in UI** (enforced by team convention and documented in `FIREBASE_REFERENCE.md`).

| Service | Responsibility |
|---------|----------------|
| `authService` | Firebase Auth, session cache, profile sync |
| `userService` | Firestore user profiles, preferences, following |
| `listingService` | Public CRUD API; routes to `local` or `firestore` backend |
| `listingService.dev.ts` / `.firestore.ts` | Dual backends without breaking the public API |
| `messageService` / `messageService.dev.ts` | Messaging API (Firestore variant pending) |
| `storageService` | Dev data URLs + Firebase Storage upload for listing images |

## Contexts for app state

| Context | Role |
|---------|------|
| `AuthContext` | Session user, login/logout/Google, `refreshProfile` |
| `ListingsContext` | Feed data, CRUD orchestration |
| `MessagesContext` | Conversations, messages, send |

Contexts orchestrate services; they do not embed Firebase SDK calls.

## Routing improvements

- **Guest vs protected** routes via `AuthGate`, `GuestRoute`, `ProtectedRoute`
- **Post-auth redirect** via `getPostAuthPath()` preserving `state.from`
- **Dual layouts:** `AppShellLayout` (tabs) vs `StackShellLayout` (drill-in)
- **Central paths** in `src/routes/paths.ts` — 12+ named routes including `/settings`, `/profile/following`

## Normalized data model

- **Listings:** `listingPurpose` as primary; legacy `listingType`, `category` kept for compatibility
- **Users:** flattened preferences and `following` array on same document (per `PRODUCT_DECISIONS.md`)
- **Mapping utilities:** `listingMapping.ts`, `listingNormalize.ts`, `avatarDisplay.ts` centralize transforms

## Reusable components

Notable additions: `Avatar`, `FollowButton`, `GoogleAuthButton`, `ListingForm`, `ImageUploader`, `MarketplaceToggle`, messaging suite (`ChatWindow`, `MessageBubble`, etc.), shell primitives (`Page`, `PageHeader`).

---

# 4. Firebase Work

## Authentication

- Email/password: `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`
- Google: `signInWithPopup` + `ensureGoogleUserProfile()` on first sign-in
- Password: `sendPasswordResetEmail`, `reauthenticateWithCredential` + `updatePassword`
- Provider detection: `isEmailPasswordUser()` for Settings UI branching

## Firestore

| Collection | Status |
|------------|--------|
| `users/{uid}` | **In use** — profile, preferences, following |
| `listings/{id}` | **Implemented in service** — requires backend flip + rules |
| `conversations` | **Schema documented** — not implemented in service |
| `messages` | **Schema documented** — not implemented in service |

Collection names centralized in `src/config/firebaseCollections.ts`.

## Storage

- Bucket via `VITE_FIREBASE_STORAGE_BUCKET`
- Path pattern: `listings/{userId}/{listingId}/{timestamp}-{filename}`
- **Offers only** — requests force `imageUrls: []`
- Client validation: JPEG/PNG/WebP, max **2 MB** (`src/utils/imageFile.ts`)

## Hosting

```json
// firebase.json — public: dist, SPA rewrite to index.html
```

Deploy command (after setting project id in `.firebaserc`):  
`npm run build && firebase deploy --only hosting`

## Rules

- **Firestore:** authenticated read on users; create/update own `users/{uid}` only
- **Storage:** referenced in `firebase.json` but **`storage.rules` file missing from repo**

## Environment configuration

Required variables (see `src/lib/firebase.ts`):

- `VITE_FIREBASE_API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID`
- `VITE_LISTINGS_BACKEND` — `local` (default) or `firestore`

---

# 5. UI Redesign

## Offer vs Request workflow

The marketplace shifted from abstract “lending/wanted” to **Offer** (I have a game) and **Request** (I want a game):

- **Offers:** optional photo, availability toggle, rent/trade/borrow arrangement, optional tutorial URL, price for rentals
- **Requests:** no photo UI, multi-select request options, compact cards in feed, “close/reopen request” on detail

`MarketplaceToggle` on the dashboard switches the entire feed context.

## Improved listing creation

`ListingForm` (~700 lines) provides guided purpose selection, conditional fields, multi-category chips, and `ImageUploader` (max one image for offers). Validation aligns with Firestore payload builders.

## Profile improvements

- `ProfileHeader` uses `Avatar` component
- Settings + Following links on profile
- Edit profile with live avatar preview
- Preferences control photo and following list visibility

## Dashboard improvements

Search in header, category chips, purpose toggle, horizontal exchange filter pills, skeleton loading, and filtered empty states.

## Detail pages

`ListingDetailPage` shows purpose-specific metadata, owner card (avatar + follow for non-owners), owner management actions (edit, availability, delete), and CTA buttons (Request Game / Message Owner — latter unwired).

## Settings

Dedicated `/settings` stack page: logout, password management, link to edit profile, preference toggles, privacy copy.

---

# 6. Team Contributions

Assignments are documented in `docs/SPRINT1_OVERVIEW.md`. Work below is grouped by **documented ownership**; items without clear single-owner attribution are marked accordingly.

## Developer 1 — Listings & Firestore (`SPRINT1_DEV1_FIREBASE_LISTINGS.md`)

- Offer/Request schema, mapping, and UI refactor across form, cards, feed, detail
- `listingService.firestore.ts` CRUD implementation
- Firebase Storage integration for offer listing images (`storageService.ts`, `listingService.firestore.ts`)
- 2 MB image size limit
- `listingService.ts` backend router (`local` / `firestore`)
- Listing filters, categories, and display utilities

## Developer 2 — Messaging (`SPRINT1_DEV2_MESSAGING.md`)

- Messaging component suite (`src/components/messaging/*`)
- `InboxPage`, `ChatPage`, `MessagesContext`
- `messageService.dev.ts` localStorage backend with seed data
- `devCreateConversation`, send message, fetch conversations/messages
- Sprint documentation and bug tracking (`CURRENT_BUGS.md`)

**Not completed (Dev 2 scope):** Firestore `messageService.firestore.ts`, Message Owner button wiring, Firestore messaging rules.

## Developer 3 — Profile, Auth & Hosting (`SPRINT1_DEV3_PROFILE_AUTH.md`)

- Firebase Auth integration (email/password foundation from earlier commits; Google login)
- Profile/settings foundation (`SettingsPage`, `EditProfilePage`, `userService`)
- Google Sign In, forgot password, change password
- Avatar system (`Avatar.tsx`, initials fallback)
- Follow system (`FollowButton`, `FollowingPage`, `userService` follow methods)
- `firebase.json`, `.firebaserc`, Firestore users rules
- Profile/button polish; `PRODUCT_DECISIONS.md`; implementation audit docs

## Shared / cross-cutting

- Routing architecture and protected routes — implemented during the sprint (early commits: auth flow, listings context)
- `docs/FIREBASE_REFERENCE.md`, `APP_ARCHITECTURE.md`, sprint overview — team documentation
- PWA configuration in `vite.config.ts` — implemented during the sprint

---

# 7. Challenges Encountered

| Challenge | How it was solved |
|-----------|-------------------|
| **Firebase without breaking dev** | `isFirebaseConfigured` guard in `firebase.ts`; app loads with warning when `.env` is missing |
| **Single auth listener rule** | `authService.subscribeToAuthChanges` updates `cachedUser` + `AuthContext`; profile refresh via `refreshSessionProfile()` instead of second listener |
| **Listings migration local → Firestore** | Dual backend pattern (`listingService.dev.ts` + `.firestore.ts`) behind one public API; env flag to switch |
| **Offer/Request redesign mid-sprint** | `listingPurpose` as source of truth; legacy fields derived for backward compatibility; extensive mapping in `listingMapping.ts` |
| **Image storage cost & scope** | Offers only; one optional image; 2 MB limit; no profile Storage (URLs/initials/Google per product decision) |
| **Profile sync after Firestore load** | Auth listener resolves UI immediately, then enriches from Firestore in background; `refreshProfile()` after edits |
| **Dead UI buttons** | Sprint policy: hide or wire; Dev 3 removed profile dead buttons; Message Owner deferred to Dev 2 |
| **Firestore rules coordination** | Three-dev ownership split documented; users rules added first; listings/messages rules still pending |
| **Follow without public profiles** | Follow entry on listing owner card; Following page for current user only |
| **`firestore.rules` structure** | Duplicate `match` block introduced — needs consolidation before production deploy |

---

# 8. Lessons Learned

## React architecture

- **Thin pages, thick services** scales well for a three-person Firebase team — UI stays testable and merge conflicts drop.
- **Contexts as orchestrators** (not data stores with Firebase inside) keep auth/listings/messages concerns separated.
- **Route constants + layout shells** prevent one-off navigation bugs as routes grow.

## Firebase

- **Implement behind routers** (`local` / `firestore`) de-risks migration — the UI does not care which backend is active.
- **Denormalize for inbox UI** (participant names, listing title on conversations) is planned but shows early thinking about read patterns.
- **Security rules must be planned with features** — shipping Storage upload code before `storage.rules` exists blocks production deploy.

## Firestore schema

- **Purpose-first listing model** (`offer` / `request`) is clearer than legacy type strings, but compatibility layers are necessary during transition.
- **Flattening user preferences** on the user document avoids extra reads for Settings/Profile.

## State management

- Single auth listener + cached user for synchronous service reads (`getCurrentUser()`) avoids race conditions in create/update flows.

## Component reuse

- `Avatar`, `AuthField`, `Page`/`PageHeader`, and `EmptyState` reduce duplication and enforce consistent UX.

## Documentation & planning

- Splitting sprint docs by developer (`DEV1`, `DEV2`, `DEV3`) plus `PRODUCT_DECISIONS.md` reduced ambiguous product choices.
- `docs/implementation/` audit docs verified code vs checklists — markdown alone was insufficient.
- `CURRENT_BUGS.md` helped cross-team build failures, though it can go stale when fixed.

---

# 9. Future Improvements

Intentionally deferred or out of Sprint 1 scope (from product decisions and sprint docs):

| Area | Notes |
|------|-------|
| **Firestore messaging** | `messageService.firestore.ts`, persist conversations/messages, dedup by listing + participants |
| **Message Owner wiring** | Connect `ListingDetailPage` button to `createConversation` + navigate to chat |
| **Firestore listings rules** | Authenticated read; owner-only write |
| **`storage.rules`** | Create file; align with 2 MB / image type limits |
| **Production deploy** | Firebase Hosting deploy, authorized domains, password-reset email domain |
| **Flip default backend** | Team-wide `VITE_LISTINGS_BACKEND=firestore` after two-account QA |
| **Public profile routes** | View other users’ profiles (currently own profile + listing owner card) |
| **Reviews & ratings** | Profile page still shows mock stats/reviews |
| **Realtime updates** | `onSnapshot` for feed, inbox, chat (optional stretch) |
| **Notifications** | Push, unread badge on Inbox tab |
| **Advanced search** | Geo, distance, full-text |
| **Recommendations** | Based on preferences/categories |
| **Storage cleanup on delete** | Orphaned listing images when listing deleted |
| **Account linking** | Google + email same user |
| **Followers page** | Explicitly out of scope |
| **`.env.example`** | Commit template for onboarding |
| **Automated tests** | None in repo today |

---

# 10. Demo Highlights

Best features to demonstrate in a presentation (ordered for narrative flow):

1. **Google login** — fast sign-in; Google photo on profile when available
2. **Email sign up** — initials avatar without uploading a photo
3. **Dashboard** — toggle **Offers** vs **Requests**; search and category filters
4. **Create an Offer** — optional photo, categories, rent/trade/borrow, tutorial URL
5. **Create a Request** — compact form without photo; appears in request feed
6. **Upload a listing image** — with `VITE_LISTINGS_BACKEND=firestore` and Storage enabled
7. **Listing detail** — purpose-specific layout; follow listing owner (real Firestore user)
8. **Edit profile & settings** — display name, bio, avatar URL, preferences
9. **Following page** — list of followed users; unfollow
10. **Change password / forgot password** — email account flows
11. **Messaging (dev mode)** — inbox, open thread, send message, refresh persists (localStorage)
12. **Protected routing** — sign out → redirected to login; return URL after sign-in

**Demo cautions:**

- Message Owner button does not navigate yet — show inbox/chat directly instead
- Follow on **seed/mock listing owners** fails (no Firestore user doc) — use listings created by real accounts
- Listings default to **local** backend unless env is set to `firestore`

---

# 11. Statistics

Counts verified from the repository file tree (June 2026). Rounded conservatively where ambiguous.

| Metric | Count |
|--------|------:|
| **Pages** (`src/pages/*.tsx`) | 14 |
| **Components** (`src/components/**/*.tsx`) | 28 |
| **Layouts** (`src/layouts/*.tsx`) | 4 |
| **Contexts** (`src/context/*.tsx`) | 3 |
| **Service modules** (`src/services/*.ts`) | 8 |
| **Utility modules** (`src/utils/*.ts`) | 14 |
| **Type definition files** (`src/types/*.ts`) | 3 |
| **Named routes** (in `ROUTES` + param routes) | 12 |
| **Firebase service integrations** | 4 areas (Auth, Firestore users/listings, Storage images, Hosting config) |
| **Sprint documentation files** (`docs/SPRINT1_*.md`) | 4 |
| **Reference / architecture docs** | 4 (`FIREBASE_REFERENCE`, `APP_ARCHITECTURE`, `PRODUCT_DECISIONS`, `CURRENT_BUGS`) |
| **Implementation documents** (`docs/implementation/*.md`) | 7 |
| **Total markdown in `docs/`** | 20 files |
| **Git commits (recent sprint window)** | ~25+ visible in recent history |
| **Implementation checklists completed (Dev 3)** | 6 feature docs (`01`–`06`) |

**Build status:** `npm run build` — **passing**

**New pages added during Sprint 1 (representative):** `SettingsPage`, `EditProfilePage`, `FollowingPage`, `AuthSplashPage`

**New components added during Sprint 1 (representative):** `Avatar`, `FollowButton`, `GoogleAuthButton`, `ImageUploader`, messaging suite (5 files)

---

## Appendix: Key documentation index

| Document | Purpose |
|----------|---------|
| [SPRINT1_OVERVIEW.md](./SPRINT1_OVERVIEW.md) | Sprint goals, team rules, acceptance checklist |
| [PRODUCT_DECISIONS.md](./PRODUCT_DECISIONS.md) | Finalized avatar, follow, hosting, password decisions |
| [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md) | Schemas, env vars, architecture boundaries |
| [APP_ARCHITECTURE.md](./APP_ARCHITECTURE.md) | Routing, shells, navigation |
| [SPRINT1_DEV1_FIREBASE_LISTINGS.md](./SPRINT1_DEV1_FIREBASE_LISTINGS.md) | Listings Firestore + Storage tasks |
| [SPRINT1_DEV2_MESSAGING.md](./SPRINT1_DEV2_MESSAGING.md) | Messaging persistence tasks |
| [SPRINT1_DEV3_PROFILE_AUTH.md](./SPRINT1_DEV3_PROFILE_AUTH.md) | Profile, auth, follow, hosting tasks |
| [implementation/00-audit.md](./implementation/00-audit.md) | Code-verified Dev 3 audit |
| [CURRENT_BUGS.md](./CURRENT_BUGS.md) | Known issues (verify freshness before relying) |

---

*This document is intended as primary source material for GitHub Copilot Presentation Generator, PowerPoint, or similar tools. Update after production deploy and Firestore messaging ship.*
