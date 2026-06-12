# Sprint 1 — Dev 2: Messaging

**Owner:** Developer 2  
**Sprint length:** 2 weeks  
**Related:** [SPRINT1_OVERVIEW.md](./SPRINT1_OVERVIEW.md) · [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md)

---

## 1. Sprint goal

Users can tap **Message Owner** on a listing, open a chat, send messages, and **see those messages after refresh** — stored in Firestore, not localStorage only.

By sprint end:

- `createConversation` works end-to-end.
- Conversations and messages persist in Firestore.
- Inbox shows real threads; chat shows real message history.
- No duplicate conversations for the same listing + same two participants.
- Messaging-related dead buttons are fixed or hidden.

**Out of scope for Sprint 1:** typing indicators, read receipts, reactions, push notifications, group chats, realtime `onSnapshot` (optional stretch only).

---

## 2. Current status

| Area | Status |
|------|--------|
| Inbox page (`/inbox`) | **Done** — UI + routing |
| Chat page (`/inbox/:conversationId`) | **Done** — UI + routing |
| Messaging components | **Done** — `src/components/messaging/*` |
| `MessagesContext` | **Done** — loads/sends via `messageService` |
| `messageService.dev.ts` | **Done** — localStorage backend |
| `createConversation` | **Not done** — throws in `messageService.ts` |
| Message Owner button | **Not wired** — exists on `ListingDetailPage.tsx`, no working handler |
| `messageService.firestore.ts` | **Not done** — create or implement |
| Firestore persistence | **Not done** — messages lost across browsers |
| Realtime listeners | **Optional stretch** — fetch-on-load is enough for Sprint 1 |

---

## 3. Files to inspect first

- [ ] `docs/APP_ARCHITECTURE.md` — inbox/chat routes and stack shell
- [ ] `docs/FIREBASE_REFERENCE.md` — conversations/messages overview (details in this sprint doc §7)
- [ ] `src/services/messageService.ts` — public API (router)
- [ ] `src/services/messageService.dev.ts` — local backend reference
- [ ] `src/context/MessagesContext.tsx` — inbox state, send, load
- [ ] `src/types/message.ts` — `Conversation`, `Message`, `CreateConversationInput`
- [ ] `src/pages/InboxPage.tsx`
- [ ] `src/pages/ChatPage.tsx`
- [ ] `src/components/messaging/ConversationList.tsx`
- [ ] `src/components/messaging/ConversationItem.tsx`
- [ ] `src/components/messaging/ChatWindow.tsx`
- [ ] `src/components/messaging/MessageBubble.tsx`
- [ ] `src/components/messaging/MessageInput.tsx`
- [ ] `src/pages/ListingDetailPage.tsx` — Message Owner button
- [ ] `src/routes/paths.ts` — `ROUTES.inbox`, `ROUTES.chat(id)`
- [ ] `src/data/mockMessages.seed.ts` — seed shape reference
- [ ] `src/config/firebaseCollections.ts` — `conversations`, `messages`
- [ ] `src/services/authService.ts` — `getCurrentUser()`
- [ ] `src/services/listingService.ts` — `getListingById` for listing title/owner (orchestration only)

---

## 4. Files this developer owns

| File | Action |
|------|--------|
| `src/services/messageService.ts` | Route `createConversation`, send, fetch to firestore/dev |
| `src/services/messageService.firestore.ts` | **Create/implement** Firestore backend |
| `src/services/messageService.dev.ts` | Implement `devCreateConversation` if still missing |
| `src/context/MessagesContext.tsx` | Expose `createConversation`; refresh list after create |
| `src/pages/ListingDetailPage.tsx` | Wire Message Owner button |
| `src/pages/InboxPage.tsx` | Empty/loading/error states (if easy) |
| `src/pages/ChatPage.tsx` | Empty/loading/error states (if easy) |
| `firestore.rules` | Add conversations/messages rules (coordinate with Dev 1/3) |

---

## 5. Files to avoid touching

| File | Why |
|------|-----|
| `src/services/listingService.firestore.ts` | Dev 1 |
| `src/context/AuthContext.tsx` | Dev 3 — no second listener |
| `src/services/authService.ts` | Dev 3 — only **call** `getCurrentUser()` |
| `src/services/userService.ts` | Dev 3 |
| `src/pages/ProfilePage.tsx`, settings pages | Dev 3 |
| `src/services/listingService.ts` public API | Dev 1 |

---

## 6. Step-by-step task list

### Part A — Audit local messaging (Day 1)

- [ ] Sign in → open `/inbox` — confirm seeded local conversations appear (`messageService.dev.ts`).
- [ ] Open a thread → messages load.
- [ ] Send a message → appears in thread and updates inbox preview.
- [ ] Hard refresh — data still loads from localStorage (`boardlink_conversations`, `boardlink_messages`).
- [ ] Note gaps: `createConversation` throw, Message Owner unwired.

### Part B — Implement `createConversation` (local first, then Firestore)

**In `messageService.dev.ts`:**

- [ ] Add `devCreateConversation(input: CreateConversationInput)`:
  - Input: `listingId`, `recipientId` (listing owner uid), optional `initialMessage`
  - **Find existing** conversation: same `listingId` + same two participant IDs (order-independent)
  - If found → return existing (no duplicate)
  - If not found → create `Conversation` with generated id, `participantIds`, `participantNames`, `listingId`, `listingTitle`, `lastMessageText`, `lastMessageAt`, `unreadCount`
  - If `initialMessage` → append first `Message`

**In `messageService.ts`:**

- [ ] `createConversation` → call dev or firestore implementation based on backend flag (mirror listings pattern if one exists; otherwise default to firestore when ready).

### Part C — Wire Message Owner (`ListingDetailPage.tsx`)

- [ ] Add `onClick` handler on **Message Owner** button.
- [ ] Require signed-in user (`useAuth`).
- [ ] If `user.id === listing.ownerId` → hide button or show “This is your listing” (no self-message).
- [ ] Call `createConversation({ listingId, recipientId: listing.ownerId })`.
- [ ] Navigate to `ROUTES.chat(conversation.id)`.
- [ ] Show loading state on button while creating; show error if fails.
- [ ] Optional: refresh `MessagesContext` conversation list after create.

### Part D — Firestore backend (`messageService.firestore.ts`)

Create file if missing. Implement:

- [ ] **`fetchConversations()`** — query conversations where `participantIds` array-contains `getCurrentUser().id`, order by `lastMessageAt` desc.
- [ ] **`fetchMessages(conversationId)`** — read subcollection `conversations/{id}/messages`, order by `createdAt` asc.
- [ ] **`sendMessage(conversationId, text)`** — add message doc; update parent conversation `lastMessage`, `lastMessageAt`, `updatedAt`.
- [ ] **`createConversation(input)`** — find-or-create in Firestore (query by `listingId` + participants before `addDoc`).

**Use fetch-based reads for Sprint 1** — call on page load / after send. Realtime `onSnapshot` is optional stretch.

### Part E — Route service to Firestore

- [ ] Update `messageService.ts` to use `messageService.firestore.ts` when Firestore path is ready (keep `messageService.dev.ts` as fallback for local testing).
- [ ] Do **not** put Firestore imports in `InboxPage`, `ChatPage`, or messaging components.

### Part F — UX polish

- [ ] Inbox empty state: “No conversations yet — message a listing owner from a game page.”
- [ ] Chat empty state: “Send a message to start the conversation.”
- [ ] Loading states while fetching.
- [ ] Error banner if fetch/send fails.
- [ ] Hide **Message** button on `ProfileHeader` if not functional in Sprint 1 (coordinate Dev 3).

### Part G — Security rules

Add to `firestore.rules` (coordinate merge):

```text
match /conversations/{conversationId} {
  allow read, update: if request.auth != null
    && request.auth.uid in resource.data.participantIds;
  allow create: if request.auth != null
    && request.auth.uid in request.resource.data.participantIds;
  match /messages/{messageId} {
    allow read, create: if request.auth != null
      && request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantIds;
  }
}
```

- [ ] Publish and test with two accounts.

---

## 7. Firestore messaging data shape

### `conversations/{conversationId}`

| Field | Type | Notes |
|-------|------|-------|
| `participantIds` | `string[]` | Exactly two uids for Sprint 1 |
| `participantNames` | `map` or `string[]` | Denormalized for inbox UI |
| `listingId` | `string` | Link to listing |
| `listingTitle` | `string` | Denormalized for inbox preview |
| `lastMessage` | `string` | Preview text |
| `lastMessageAt` | `Timestamp` | Sort inbox |
| `createdAt` | `Timestamp` | |
| `updatedAt` | `Timestamp` | |

### `conversations/{conversationId}/messages/{messageId}`

| Field | Type | Notes |
|-------|------|-------|
| `senderId` | `string` | Firebase uid |
| `text` | `string` | Message body |
| `createdAt` | `Timestamp` | |

**Dedup rule:** Before creating, query conversations where `listingId == X` and `participantIds` contains current user; filter client-side for matching recipient.

---

## 8. How to test

### Message Owner flow

- [ ] User A creates a listing (with Dev 1’s Firestore listings when ready).
- [ ] User B opens listing detail → taps **Message Owner**.
- [ ] Navigates to chat thread.
- [ ] User B sends message → appears immediately.
- [ ] User B refreshes → message still there.
- [ ] User A opens Inbox → sees conversation.
- [ ] User A opens thread → sees User B’s message.
- [ ] User B taps Message Owner **again** on same listing → **same** conversation (no duplicate).

### Edge cases

- [ ] Owner viewing own listing — Message Owner hidden or disabled.
- [ ] Logged out user — redirected to login (protected route).
- [ ] Guest cannot access `/inbox`.

### Build

- [ ] `npm run build` passes.
- [ ] No `firebase/firestore` imports in pages or `src/components/messaging/*`.

---

## 9. Definition of done

- [ ] Message Owner button works on `ListingDetailPage.tsx`.
- [ ] `createConversation` implemented (dev + firestore).
- [ ] Conversations stored in Firestore `conversations`.
- [ ] Messages stored in Firestore subcollection `messages`.
- [ ] Inbox shows real Firestore conversations for signed-in user.
- [ ] Chat shows real messages; send persists after refresh.
- [ ] No duplicate conversations for same listing + participants.
- [ ] Fetch-based messaging works (realtime optional).
- [ ] No typing indicators, read receipts, reactions, push, or group chat.
- [ ] Dead messaging buttons hidden or working.
- [ ] `messageService.dev.ts` not deleted.

---

## 10. Handoff notes

Tell the team:

1. Collection paths and field names used.
2. How conversation dedup works (query + filter rules).
3. Whether realtime was added or deferred.
4. Firestore indexes created (e.g. `participantIds` + `lastMessageAt`).
5. Env vars or flags to switch dev vs firestore messaging (if any).
6. Remaining UX gaps for Sprint 2.

---

## If confused, check…

- `src/types/message.ts` — TypeScript shapes
- `src/data/mockMessages.seed.ts` — example conversations
- `messageService.dev.ts` — working local pattern to mirror
- [SPRINT1_OVERVIEW.md](./SPRINT1_OVERVIEW.md) — conflict files (`ListingDetailPage.tsx`)
- Dev 1 — confirm `listing.ownerId` is real Firebase uid on Firestore listings
