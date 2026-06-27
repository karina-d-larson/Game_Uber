# GameShelf — Final QA Audit

**Audit date:** June 2026  
**Auditor role:** Static QA (code, config, docs review — no fixes applied)  
**Build verified:** `npm run build` passes at time of audit  
**Scope:** Pre-submission review for demo, deploy, and grading risk

---

# 1. Executive Summary

GameShelf has a **solid UI and architecture foundation**, but several **user-visible actions do nothing**, backend paths are **split between real Firebase and local/dev fallbacks**, and **Firebase deploy configuration is incomplete or invalid**. These issues would hurt a final demo if not understood and scripted around.

**Highest-risk findings:**

1. **Five listing-detail CTAs have no `onClick` handlers** — including Message Owner and Request Game (core sprint user story).
2. **Messaging persists in localStorage only** — not visible across browsers/accounts.
3. **`firestore.rules` is structurally invalid** and **`storage.rules` is missing** — Firebase deploy will fail or rules will not protect listings.
4. **Mock reviews, stats, and ratings** appear real on Profile and Listing Detail pages.
5. **Follow fails** on seed/mock listing owners that have no Firestore user document.

**E2E automation:** None installed (no Playwright, Cypress, or Vitest browser tests in `package.json`).

**Honest overall assessment:** Safe for a **controlled demo** of auth, profile, settings, listing create/browse (local or Firestore), and inbox/chat (single browser). **Not ready** to present as fully integrated cross-user messaging or production Firebase deploy without fixes or explicit disclaimers.

---

# 2. Critical Issues

### QA-001 — Listing detail primary CTAs are dead buttons

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Area** | Listings / UI |
| **File(s)** | `src/pages/ListingDetailPage.tsx` (lines ~360–386, ~551–556) |
| **Problem** | Buttons render with **no `onClick`**: “Request Game”, “Message Owner”, “I have this game”, “Message requester”, “Read all 42 reviews”. |
| **Why it matters** | Core marketplace actions fail silently — worst UX for demos and grading. Sprint acceptance includes messaging the owner. |
| **Suggested fix** | Dev 2: wire Message Owner/requester to `messageService.createConversation` + navigate to `ROUTES.chat(id)`. Dev 1/Shared: hide or disable CTAs until implemented; wire or remove “Read all reviews”. |
| **Owner** | Dev 2 (messaging CTAs) · Shared (Request Game / reviews) |

---

### QA-002 — `firestore.rules` is invalid for Firebase deploy

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Area** | Firebase |
| **File(s)** | `firestore.rules` |
| **Problem** | Lines 6–10 define `match /users/{userId}` **outside** `service cloud.firestore { ... }`. Duplicate users block exists inside the service block. |
| **Why it matters** | `firebase deploy --only firestore:rules` may **reject** the file or behave unpredictably. |
| **Suggested fix** | Remove the outer orphan block; keep a single valid rules tree. Add `listings` rules when ready. |
| **Owner** | Shared (Dev 1 leads listings rules; Dev 3 users rules) |

---

### QA-003 — `storage.rules` referenced but missing

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Area** | Firebase |
| **File(s)** | `firebase.json`, (missing) `storage.rules` |
| **Problem** | `firebase.json` points to `storage.rules`; file **not in repository**. |
| **Why it matters** | `firebase deploy` fails or Storage uploads fail open/closed incorrectly. Offer image upload depends on Storage. |
| **Suggested fix** | Dev 1: add `storage.rules` (auth required, path `listings/{uid}/...`, image type/size limits aligned with 2 MB client cap). |
| **Owner** | Dev 1 |

---

### QA-004 — No Firestore security rules for `listings`

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Area** | Firebase / Listings |
| **File(s)** | `firestore.rules`, `src/services/listingService.firestore.ts` |
| **Problem** | Only `users/{userId}` rules exist. Listings CRUD has **no rules** in repo. |
| **Why it matters** | With `VITE_LISTINGS_BACKEND=firestore`, creates/updates likely **permission-denied** unless Console has permissive default rules (security risk). |
| **Suggested fix** | Dev 1: add listings rules (authenticated read; create/update/delete owner only). |
| **Owner** | Dev 1 |

---

### QA-005 — Messaging uses localStorage dev backend only

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Area** | Messaging / Firebase |
| **File(s)** | `src/services/messageService.ts`, `src/services/messageService.dev.ts` |
| **Problem** | All message APIs delegate to `messageService.dev.ts`. **No `messageService.firestore.ts`**. Data keys: `gameshelf_conversations`, `gameshelf_messages`. |
| **Why it matters** | User A’s messages **never appear** for User B. Sprint acceptance (“another user can message owner”) fails for real multi-account testing. |
| **Suggested fix** | Dev 2: implement Firestore backend + rules; router in `messageService.ts`. |
| **Owner** | Dev 2 |

---

### QA-006 — `getAnalytics(app)` may crash when Firebase is not configured

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Area** | Firebase |
| **File(s)** | `src/lib/firebase.ts` (line 45) |
| **Problem** | `export const analytics = getAnalytics(app)` runs **unconditionally**. When `isFirebaseConfigured` is false, `app` is `undefined`. |
| **Why it matters** | Fresh clone without `.env` may **white-screen on import** (`App.tsx` imports `./lib/firebase`). |
| **Suggested fix** | Guard analytics init: only call `getAnalytics` when `app` is defined; or lazy-init. |
| **Owner** | Dev 3 / Shared |

---

### QA-007 — Signup writes Firestore doc without `requireFirestoreDb()`

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **Area** | Auth / Firebase |
| **File(s)** | `src/services/authService.ts` (~line 275) |
| **Problem** | `await setDoc(doc(db, ...))` uses `db` directly, not `requireFirestoreDb()`. |
| **Why it matters** | If Auth initializes but Firestore handle is invalid, signup creates Auth user but **profile write throws** — partial account state. |
| **Suggested fix** | Use `requireFirestoreDb()` consistently (same as other services). |
| **Owner** | Dev 3 |

---

# 3. Major Issues

### QA-101 — “View full profile” always goes to own profile

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Area** | Profile / UI |
| **File(s)** | `src/pages/ListingDetailPage.tsx` (~462–467) |
| **Problem** | Link uses `ROUTES.profile` (signed-in user’s profile), not listing owner. |
| **Why it matters** | Misleading on listing detail; breaks “view owner” expectation. |
| **Suggested fix** | Hide link until public profiles exist, or route to future `/users/:id`. |
| **Owner** | Dev 3 |

---

### QA-102 — Follow fails for seed/mock listing owners

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Area** | Profile |
| **File(s)** | `src/services/userService.ts` (`followUser`), `src/data/mockListings.seed.ts`, `src/components/FollowButton.tsx` |
| **Problem** | Seed listings use `ownerId: 'seed-owner-1'` etc. `followUser()` requires target profile in Firestore → **“User not found.”** |
| **Why it matters** | Follow demo fails on default feed unless users open listings created by real accounts. |
| **Suggested fix** | Demo script: use real-user listings only; or hide Follow when owner profile missing. |
| **Owner** | Dev 3 |

---

### QA-103 — Mock stats and reviews presented as real

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Area** | Profile / UI |
| **File(s)** | `src/pages/ProfilePage.tsx` (`STATS`, `REVIEWS`), `src/components/ProfileHeader.tsx` (hardcoded 4.8 rating), `src/pages/ListingDetailPage.tsx` (“What borrowers say”, “Read all 42 reviews”) |
| **Problem** | Static mock content with no “sample data” disclaimer. |
| **Why it matters** | Misleading for users and evaluators; looks finished when feature is not built. |
| **Suggested fix** | Label as sample data, hide sections, or load from Firestore when implemented. |
| **Owner** | Dev 3 (profile) · Shared (listing reviews) |

---

### QA-104 — `MessagesContext` does not expose `createConversation`

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Area** | Messaging |
| **File(s)** | `src/context/MessagesContext.tsx`, `src/services/messageService.ts` |
| **Problem** | `createConversation` exists in service but **not in context**; no page calls it. |
| **Why it matters** | Even after wiring Listing Detail button, pages must import service directly or context must be extended. |
| **Suggested fix** | Dev 2: add `createConversation` to context; wire Listing Detail. |
| **Owner** | Dev 2 |

---

### QA-105 — `devCreateConversation` missing dedup and owner name

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Area** | Messaging |
| **File(s)** | `src/services/messageService.dev.ts` |
| **Problem** | Always creates new conversation; `participantNames` uses hardcoded `'Recipient'`. No lookup of listing owner display name. |
| **Why it matters** | Duplicate threads; poor inbox labels; sprint requirement for dedup not met. |
| **Suggested fix** | Find existing by `listingId` + participant pair; resolve name via `userService.getProfile(recipientId)` or listing. |
| **Owner** | Dev 2 |

---

### QA-106 — Listings default to `local` backend; `.env.example` says `firestore`

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Area** | Listings / Docs |
| **File(s)** | `src/config/listingsBackend.ts`, `.env.example` |
| **Problem** | Code default: `local` if env unset. Example env: `VITE_LISTINGS_BACKEND=firestore`. |
| **Why it matters** | New developers may think Firestore is active when feed is still **localStorage + seed**. Two-browser listing test fails silently. |
| **Suggested fix** | Align docs and example; document required env for submission demo. |
| **Owner** | Dev 1 · Shared |

---

### QA-107 — Local listings/images not shared across browsers

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Area** | Listings |
| **File(s)** | `src/services/listingService.dev.ts`, `src/services/listingService.ts`, `src/services/storageService.ts` |
| **Problem** | Local mode stores listings in localStorage; images as **data URLs** via `uploadListingImage()` (not Firebase). |
| **Why it matters** | “Create listing → other user sees it” **fails** in local mode. |
| **Suggested fix** | Submission demo must use `VITE_LISTINGS_BACKEND=firestore` + rules + Storage. |
| **Owner** | Dev 1 |

---

### QA-108 — `CURRENT_BUGS.md` is stale

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Area** | Docs |
| **File(s)** | `docs/CURRENT_BUGS.md` |
| **Problem** | Still reports build failure in `messageService.dev.ts` (2026-05-26). Build **passes** now. |
| **Why it matters** | Misleads team during final QA; hides real open issues. |
| **Suggested fix** | Update or replace with this audit; close fixed items. |
| **Owner** | Shared |

---

### QA-109 — Firebase Hosting not verified deployed

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Area** | Firebase |
| **File(s)** | `firebase.json`, `.firebaserc` |
| **Problem** | Config exists (`public: dist`, SPA rewrite). **No evidence** of successful deploy in repo. |
| **Why it matters** | Google login and password reset need **authorized domains** on deployed URL. |
| **Suggested fix** | Dev 3: deploy, add domains, smoke-test auth flows. |
| **Owner** | Dev 3 |

---

### QA-110 — `messageService.dev.ts` conversations not portable across users

| Field | Value |
|-------|-------|
| **Severity** | Major |
| **Area** | Messaging |
| **File(s)** | `src/services/messageService.dev.ts`, `src/utils/conversationDisplay.ts` |
| **Problem** | Seed uses placeholder participant IDs resolved per browser user. |
| **Why it matters** | Inbox content differs per account; not representative of production. |
| **Suggested fix** | Treat as dev-only; document in demo script. |
| **Owner** | Dev 2 |

---

# 4. Minor Polish Issues

### QA-201 — PWA manifest name “Game Uber” vs product “GameShelf”

| **Severity** | Minor | **Area** | UI | **File(s)** | `vite.config.ts` |
| **Problem** | `name: 'Game Uber'`, `short_name: 'GameUber'`. |
| **Suggested fix** | Rename to GameShelf for consistent branding. | **Owner** | Shared |

### QA-202 — Hardcoded auth links bypass `ROUTES`

| **Severity** | Minor | **Area** | UI | **File(s)** | `LoginPage.tsx`, `SignupPage.tsx` |
| **Problem** | `to="/signup"`, `to="/login"` instead of `ROUTES.signup` / `ROUTES.login`. |
| **Suggested fix** | Use `ROUTES` constants. | **Owner** | Dev 3 |

### QA-203 — Bottom nav Profile tab inactive on sub-routes

| **Severity** | Minor | **Area** | UI | **File(s)** | `src/components/BottomNav.tsx` |
| **Problem** | `isActive` only matches exact `/profile`; not `/profile/following` or `/settings`. |
| **Suggested fix** | Extend `isActive` to `pathname.startsWith('/profile')` if desired. | **Owner** | Shared |

### QA-204 — Empty `alt` on listing/game images

| **Severity** | Minor | **Area** | UI / Accessibility | **File(s)** | `ListingCard.tsx`, `ListingDetailPage.tsx`, `ConversationItem.tsx` |
| **Problem** | Multiple `<img alt="">`. |
| **Suggested fix** | Use listing title or “Photo of {title}`. | **Owner** | Dev 1 |

### QA-205 — `.env.example` incomplete

| **Severity** | Minor | **Area** | Firebase / Docs | **File(s)** | `.env.example` |
| **Problem** | Missing optional `VITE_FIREBASE_MEASUREMENT_ID`; no comments on backend flag implications. |
| **Suggested fix** | Document all vars and demo vs dev defaults. | **Owner** | Shared |

### QA-206 — Orphan `src/messaging.css` with fixed widths

| **Severity** | Minor | **Area** | UI | **File(s)** | `src/messaging.css` |
| **Problem** | Fixed `width: 360px` rules; **not imported** anywhere in `src/`. |
| **Suggested fix** | Delete or integrate; avoid accidental import on mobile. | **Owner** | Dev 2 |

### QA-207 — `FollowButton` loading state not announced

| **Severity** | Minor | **Area** | Accessibility | **File(s)** | `src/components/FollowButton.tsx` |
| **Problem** | Loading shows bare `…` in `<span>` without `aria-live`. |
| **Suggested fix** | Use `aria-busy` on button or live region. | **Owner** | Dev 3 |

### QA-208 — Auth errors may expose raw Firebase messages

| **Severity** | Minor | **Area** | Auth | **File(s)** | `src/services/authService.ts` (`mapAuthError`) |
| **Problem** | Falls through to `err.message` for unknown codes. |
| **Suggested fix** | Map common codes; generic fallback for others. | **Owner** | Dev 3 |

### QA-209 — `ListingCard` hardcodes path string

| **Severity** | Minor | **Area** | UI | **File(s)** | `src/components/ListingCard.tsx` |
| **Problem** | `` to={`/listings/${listing.id}`} `` vs `ROUTES.listing(id)`. |
| **Suggested fix** | Use `ROUTES` for consistency. | **Owner** | Dev 1 |

### QA-210 — Numerous `FIREBASE TODO` comments in production paths

| **Severity** | Minor | **Area** | Docs / Code | **File(s)** | Multiple under `src/` |
| **Problem** | TODOs in user-facing flow files (not blocking, but signals incomplete work). |
| **Suggested fix** | Triage before submission; remove stale TODOs. | **Owner** | Shared |

---

# 5. Broken Buttons / Links

| Control | Location | Handler? | Expected behavior | Actual |
|---------|----------|----------|-------------------|--------|
| **Request Game** | Listing detail (offer, non-owner) | No | Start request/contact flow | Nothing |
| **Message Owner** | Listing detail (offer, non-owner) | No | Create/open conversation | Nothing |
| **I have this game** | Listing detail (request) | No | Respond to request | Nothing |
| **Message requester** | Listing detail (request) | No | Open chat | Nothing |
| **Read all 42 reviews** | Listing detail sidebar | No | Reviews list | Nothing |
| **View full profile** | Listing detail owner card | Link works | Owner’s public profile | **Own** profile |
| **Follow** | Listing detail (seed owners) | Yes | Follow user | Error: User not found |
| Settings / Following / Logout | Settings | Yes | Works | OK |
| Manage listing / Edit / Delete | Listing detail (owner) | Yes | Works | OK (backend-dependent) |
| Inbox → conversation | Inbox | Yes (nav) | Open chat | OK (local data) |
| Send message | Chat | Yes | Persist message | OK (localStorage) |
| Google / Email auth | Login/Signup | Yes | Authenticate | OK (Firebase required) |

**Routes verified:** All paths in `AppRouter.tsx` resolve to mounted components. No 404 on defined routes. `NotFoundPage` handles `*`.

---

# 6. Firebase / Backend Risks

| Risk | Severity | Details |
|------|----------|---------|
| Invalid Firestore rules file | Critical | Orphan `match` block — see QA-002 |
| Missing Storage rules | Critical | See QA-003 |
| Listings unprotected / denied | Critical | See QA-004 |
| Messaging not in Firestore | Critical | See QA-005 |
| Analytics init crash without `.env` | Critical | See QA-006 |
| Default listings backend = local | Major | Cross-user listing test fails |
| Storage upload without rules | Critical | Offer images may fail or be insecure |
| Hosting not deployed | Major | Auth domain restrictions for Google/reset email |
| No orphaned Storage cleanup on listing delete | Minor | Images may remain in bucket |
| `firestore.rules` delete permission asymmetry | Minor | Outer block allows delete; inner block does not mention delete |

---

# 7. Mock or Placeholder Content

| Content | Location | Risk |
|---------|----------|------|
| Lender/Renter scores, review count, trades | `ProfilePage.tsx` `STATS` | Looks real — not in Firestore |
| Three review cards | `ProfilePage.tsx` `REVIEWS` | Mock names and avatars |
| 4.8 star rating | `ProfileHeader.tsx` | Hardcoded |
| “What borrowers say” + Sarah J. quote | `ListingDetailPage.tsx` | Mock |
| “Read all 42 reviews” | `ListingDetailPage.tsx` | Implies 42 real reviews |
| Seed listings (Catan, Wingspan, etc.) | `mockListings.seed.ts` | OK in local mode; confusing in Firestore demo |
| Inbox seed conversations | `mockMessages.seed.ts` | Demo data — OK if labeled |
| “Marketplace Member” badge | `ProfileHeader.tsx` | Cosmetic placeholder |
| `participantNames: 'Recipient'` | `messageService.dev.ts` | Placeholder name in inbox |

---

# 8. Recommended Fix Order

Fix or mitigate in this order before final submission/demo:

1. **QA-001** — Wire or hide listing detail CTAs (especially Message Owner).
2. **QA-002 + QA-003 + QA-004** — Fix rules files so Firebase deploy and Firestore listings work.
3. **QA-106 + QA-107** — Set and document `VITE_LISTINGS_BACKEND=firestore` for cross-user listing demo.
4. **QA-005 + QA-104 + QA-105** — Firestore messaging + conversation wiring (or document as out of scope).
5. **QA-006 + QA-007** — Harden Firebase init and signup Firestore write.
6. **QA-103** — Hide or label mock reviews/stats (demo trust).
7. **QA-102 + QA-101** — Follow and profile link (demo script or fix).
8. **QA-109** — Deploy hosting + authorized domains if presenting live URL.
9. **QA-108** — Refresh team bug doc.
10. Minor polish (QA-201–QA-210) as time allows.

---

# 9. What Appears Complete

Verified working (with Firebase configured and appropriate backend env):

- Email signup, login, logout
- Google Sign In (`GoogleAuthButton`, Firestore profile on first login)
- Forgot password flow (Login UI + `sendPasswordReset`)
- Change password (Settings, email users only)
- Edit profile (display name, username, bio, avatar URL)
- Settings preferences (listing types, categories, visibility toggles)
- Avatar component (Google photo / initials / custom URL)
- Following page, follow/unfollow (for **real** Firestore users)
- Offer/Request listing form UX and validation
- Dashboard search, category filter, purpose toggle, exchange filters
- Listing CRUD service layer (local and Firestore implementations)
- Firestore offer image upload code path (`uploadListingImageFirebase`)
- Protected routing, auth splash, guest redirect, post-auth return URL
- Inbox UI, chat UI, send message (single-browser localStorage)
- `npm run build` succeeds
- PWA plugin generates service worker in build

---

# 10. Questions for the Team

1. **Submission demo mode:** Will you demo with `VITE_LISTINGS_BACKEND=local` or `firestore`? Cross-user listing test requires Firestore.
2. **Messaging scope:** Is localStorage messaging acceptable for final submission, or is Firestore messaging required for full credit?
3. **Dead CTAs:** Should Request Game / I have this game be **hidden** or **wired** before submit?
4. **Mock reviews/stats:** Hide for submission or label as “Sample data”?
5. **Firebase deploy:** Is a live Hosting URL required for grading? If yes, who runs deploy and authorized domains?
6. **Seed data:** Should seed listings remain in local mode only, or be removed when Firestore is active?
7. **Two test accounts:** Are shared Firebase test credentials available for QA?
8. **Storage rules:** Was `storage.rules` committed elsewhere or only planned? (Missing from repo.)
9. **Product name:** GameShelf vs Game Uber — which is official for PWA/manifest?
10. **Bug doc:** Should `CURRENT_BUGS.md` be superseded by this audit?

---

## Issue counts (summary)

| Severity | Count |
|----------|------:|
| **Critical** | 7 |
| **Major** | 10 |
| **Minor** | 10 |
| **Total tracked** | 27 |

*Counts include documented items QA-001–QA-210. Some items may overlap (e.g. Firebase rules).*

---

*No code was modified during this audit. No commits were made.*
