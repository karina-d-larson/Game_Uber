# TODO — Messaging + Profile

**Owner:** Messaging / profile teammate  
**Related docs:** `docs/FIREBASE_INTEGRATION.md`, `docs/APP_ARCHITECTURE.md`  
**Do not overlap with:** `docs/TODO_FIREBASE_BACKEND.md` (listings Firestore + Storage + rules)

---

## 1. Purpose

Complete the **user-facing messaging and profile flows** on top of the existing React architecture.

You own:

- Making **Message Owner** work end-to-end (mock/local backend for now)
- Inbox + chat UX polish and persistence verification
- **Profile editing** (display name, username, avatar URL, bio)
- Preparing messaging for future Firestore (optional placeholder file only)

You do **not** own Firestore listings, Storage uploads, or security rules — see the other TODO file.

---

## 2. Current status

| Area | Status |
|------|--------|
| Inbox page + chat page | **Done** — routes `/inbox`, `/inbox/:conversationId` |
| Messaging UI components | **Done** — `src/components/messaging/*` |
| Mock messaging backend | **Done** — `messageService.dev.ts` + localStorage |
| `MessagesContext` | **Done** — loads/sends via `messageService` |
| `createConversation` | **Not implemented** — throws in `messageService.ts` |
| Message Owner button | **Not wired** — button exists on `ListingDetailPage.tsx` with no `onClick` |
| Profile display | **Partial** — shows `AuthContext` user + bio from Firestore; stats/reviews are hardcoded mocks |
| Profile editing | **Done** — `userService.ts`, `/profile/edit`, `EditProfilePage.tsx` |
| Firestore messaging | **Out of scope** unless team explicitly assigns later |

---

## 3. Files to inspect first

Read these before changing anything:

- [ ] `src/services/messageService.ts` — public messaging API
- [ ] `src/services/messageService.dev.ts` — localStorage backend
- [ ] `src/context/MessagesContext.tsx` — inbox state, send, load messages
- [ ] `src/types/message.ts` — `Conversation`, `Message`, `CreateConversationInput`
- [ ] `src/pages/InboxPage.tsx` — conversation list
- [ ] `src/pages/ChatPage.tsx` — chat thread
- [ ] `src/components/messaging/` — `ConversationList`, `ConversationItem`, `ChatWindow`, `MessageBubble`, `MessageInput`
- [ ] `src/data/mockMessages.seed.ts` — seed conversations (linked to listings via `listingId`)
- [ ] `src/pages/ListingDetailPage.tsx` — **Message Owner** button (~line 261)
- [ ] `src/routes/paths.ts` — `ROUTES.chat(conversationId)`, `ROUTES.inbox`
- [ ] `src/pages/ProfilePage.tsx` — profile display (static stats/reviews)
- [ ] `src/components/ProfileHeader.tsx` — presentational header
- [ ] `src/services/authService.ts` — signup writes `users/{uid}`; `getCurrentUser()`
- [ ] `src/types/user.ts` — `AuthUser`, `UserProfile`
- [ ] `html/inbox.html` / `html/messaging.html` — design reference only (not production code)

---

## 4. Files this teammate owns

| File | Action |
|------|--------|
| `src/services/messageService.ts` | Implement `createConversation` routing to dev backend |
| `src/services/messageService.dev.ts` | Add `devCreateConversation` (find-or-create logic) |
| `src/pages/ListingDetailPage.tsx` | Wire Message Owner button |
| `src/context/MessagesContext.tsx` | Optional: expose `createConversation` action |
| `src/services/userService.ts` | **Create** — profile read/update |
| `src/pages/EditProfilePage.tsx` or profile modal | **Create** — edit UI |
| `src/pages/ProfilePage.tsx` | Load real profile fields; link to edit |
| `src/components/ProfileHeader.tsx` | Show bio from profile (optional) |
| `src/routes/AppRouter.tsx` | Add edit profile route if using a page |
| `src/routes/paths.ts` | Add `editProfile` path if needed |
| `src/services/messageService.firestore.ts` | **Optional placeholder only** — stubs for future Firebase |

---

## 5. Files to avoid editing

| File | Why |
|------|-----|
| `src/services/listingService.ts` | Firebase backend teammate |
| `src/services/listingService.firestore.ts` | Firebase backend teammate |
| `src/services/storageService.ts` | Firebase backend teammate |
| `src/context/AuthContext.tsx` | Do not rewrite or add second auth listener |
| `src/lib/firebase.ts` | Backend teammate / shared config |
| `firestore.rules` / `storage.rules` | Backend teammate |
| `src/services/listingService.dev.ts` | Listings local backend |

**Rule:** Pages and components call **services/contexts** — no `import { db } from '../lib/firebase'` in UI files.

---

## 6. Step-by-step task list

### Part A — Messaging audit

- [ ] Open Inbox (`/inbox`) — confirm seeded conversations appear when signed in
- [ ] Open a conversation — messages load in chat view
- [ ] Send a message — appears in thread and updates inbox preview
- [ ] Hard refresh — conversations and messages still load (localStorage keys: `boardlink_conversations`, `boardlink_messages`)

### Part B — Implement `createConversation` (local backend)

`messageService.ts` currently throws. Implement using the dev backend pattern (same as listings).

- [ ] Add `devCreateConversation(input: CreateConversationInput)` in `messageService.dev.ts`
- [ ] Input shape (`src/types/message.ts`):
  - `listingId: string`
  - `recipientId: string` (listing owner’s uid)
  - `initialMessage?: string`
- [ ] **Find existing conversation** before creating:
  - Same `listingId` + both participant ids (order-independent)
  - If found, return existing conversation (avoid duplicates)
- [ ] If not found, create new `Conversation`:
  - `id` — generate unique id (e.g. `conv-{listingId}-{timestamp}`)
  - `participantIds` — `[currentUser.id, recipientId]`
  - `participantNames` — denormalized for inbox UI
  - `listingId`, `listingTitle` — from listing (pass title from page or fetch via `listingService.getListingById`)
  - `lastMessageText`, `lastMessageAt`, `unreadCount`
- [ ] If `initialMessage` provided, append first `Message` to thread
- [ ] Persist via existing `writeJson` keys in `messageService.dev.ts`
- [ ] Update `messageService.ts` `createConversation` to call `devMessages.devCreateConversation`

Example service call from a page (orchestration only):

```ts
const conversation = await messageService.createConversation({
  listingId: listing.id,
  recipientId: listing.ownerId,
})
navigate(ROUTES.chat(conversation.id), { state: { conversation } })
```

### Part C — Wire Message Owner on listing detail

File: `src/pages/ListingDetailPage.tsx`

- [ ] Add handler for **Message Owner** button (currently no `onClick`)
- [ ] Require signed-in user (`useAuth`)
- [ ] Prevent messaging yourself if `user.id === listing.ownerId`
- [ ] Call `createConversation` with `listingId` + `listing.ownerId`
- [ ] Navigate to `ROUTES.chat(conversation.id)` with optional `state: { conversation }`
- [ ] Optionally refresh `MessagesContext` conversation list after create
- [ ] Show loading/error state on button while creating

### Part D — MessagesContext cleanup (optional but recommended)

- [ ] Add `createConversation` to `MessagesContext` that calls service + updates `conversations` state
- [ ] Keep Firestore/realtime out of context for now — one-time fetch is fine for MVP

### Part E — Optional Firestore placeholder

Only if it helps the backend teammate later — **do not implement full Firestore messaging** unless assigned.

- [ ] Create `src/services/messageService.firestore.ts` with stub throws (mirror `listingService.firestore.ts` pattern)
- [ ] Add comments listing future `onSnapshot` attachment points

### Part F — Profile: `userService.ts`

- [x] Create `src/services/userService.ts`
- [x] `getProfile(uid: string)` — read `users/{uid}` from Firestore, map to `UserProfile`
- [x] `updateProfile(uid: string, patch)` — update allowed fields on `users/{uid}`
- [x] Use `COLLECTIONS.users` from `src/config/firebaseCollections.ts`
- [x] Use `getCurrentUser()` to ensure user can only update own profile
- [x] Allowed MVP fields: `displayName`, `username`, `avatar`, `bio`
- [x] Do **not** use Firebase Auth `photoURL` unless team agrees — app uses `avatar` string on profile doc today

**Implemented (Karina):** `userService.ts` reads/writes `users/{uid}` via Firestore. Validation: display name required, username min 3 chars, bio and avatar URL optional. `authService.refreshSessionProfile()` + `AuthContext.refreshProfile()` update session state after save (no second auth listener).

### Part G — Profile editing UI

- [x] Add route e.g. `/profile/edit` in `src/routes/paths.ts` and `AppRouter.tsx`
- [x] Create `EditProfilePage.tsx` (or modal on ProfilePage)
- [x] Form fields: display name, username, avatar URL, bio (textarea)
- [x] Validate username length (match signup rules in `authService` — min 3 chars)
- [x] On save: call `userService.updateProfile`, then refresh auth profile
- [x] After save: user sees updated data on Profile page without manual logout

**Refreshing UI after profile save:**

- Option A: call `authService` helper to re-fetch profile and update context (coordinate — do not add second auth listener)
- Option B: update `AuthContext` user state from returned profile in the edit page via a small context method (minimal change)

### Part H — ProfilePage data loading

- [x] Replace hardcoded bio in `ProfileHeader` / `ProfilePage` with `user.bio` when available
- [x] Keep stats/reviews as static mocks for MVP unless time allows
- [x] Add “Edit profile” button linking to edit route

---

## 7. Testing checklist

### Messaging

- [ ] Signed-in user opens Inbox — conversations list renders
- [ ] Tap conversation — chat opens with message history
- [ ] Send message — appears immediately; persists after refresh
- [ ] Open listing detail (not owner) — tap **Message Owner**
- [ ] Navigates to correct chat thread
- [ ] Tap **Message Owner** again on same listing — opens **same** conversation (no duplicate)
- [ ] Owner viewing own listing — Message Owner hidden or disabled with clear message
- [ ] Guest / logged out — protected route redirects to login

### Profile

- [ ] Open Profile — shows current username, display name, avatar
- [ ] Open Edit Profile — form pre-filled
- [ ] Save changes — Firestore `users/{uid}` updated (check Firebase Console)
- [ ] Return to Profile — changes visible
- [ ] Hard refresh — changes still visible (loaded via auth listener / profile fetch)
- [ ] Invalid username — form shows error, no save

---

## 8. Definition of done

### Messaging (MVP)

- [ ] `createConversation` works through `messageService` → `messageService.dev.ts`
- [ ] Message Owner navigates to chat
- [ ] No duplicate conversations for same listing + participants (reasonable dedup)
- [ ] No Firebase SDK imports in pages/components
- [ ] Inbox + chat + send work after browser refresh

### Profile (MVP)

- [x] `userService.ts` exists with get/update profile
- [x] User can edit display name, username, avatar URL, bio
- [x] Changes persist in Firestore `users/{uid}`
- [x] Profile UI reflects saved changes

### Explicitly out of scope (unless reassigned)

- [ ] Full Firestore messaging backend
- [ ] Realtime `onSnapshot` listeners
- [ ] Unread badge on BottomNav
- [ ] Meetup Requests carousel from `html/inbox.html`

---

## 9. Warnings / common mistakes

- **Do not put localStorage logic in components** — keep reads/writes in `messageService.dev.ts`
- **Do not import Firestore in `ChatPage` or `InboxPage`** — use `MessagesContext` + `messageService`
- **Do not rewrite `AuthContext`** — if you need profile refresh, add a minimal method or re-use `subscribeToAuthChanges` callback pattern
- **`createConversation` currently throws** — fix this before Message Owner can work
- **Recipient id** must be the listing owner’s Firebase `uid` (`listing.ownerId`), not seed ids like `seed-owner-1` when testing with Firestore listings later
- **Do not delete `messageService.dev.ts`** until Firestore messaging is implemented and tested
- **Listing detail** already imports `listingService` for load — OK for orchestration; do not add Firestore calls there

---

## 10. Final handoff notes

When finished, tell the team:

1. Message Owner flow: which listing fields are used (`ownerId`, `listingId`, `title`)
2. How conversation dedup works (matching rules)
3. Profile fields stored in Firestore and any validation rules
4. Edit profile route path
5. That Firestore messaging + realtime is still future work — backend teammate owns rules and listing Storage

**When Firebase listings go live:** Message Owner will use real `ownerId` values from Firestore listings — test with two real accounts after backend teammate flips `VITE_LISTINGS_BACKEND=firestore`.

**Merge conflict hotspots:** `ListingDetailPage.tsx`, `messageService.ts`, `ProfilePage.tsx`, `AppRouter.tsx` — use small focused PRs.
