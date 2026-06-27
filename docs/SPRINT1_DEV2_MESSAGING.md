# Final Project — Dev 2: Messaging

**Owner:** Developer 2  
**Period:** Final two-week development sprint (post–Sprint 1)  
**App:** GameShelf  
**Sources:** [QA_AUDIT_FINAL.md](./QA_AUDIT_FINAL.md) · [FINAL_WORKING_APP_BACKLOG.md](./FINAL_WORKING_APP_BACKLOG.md) · [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md)

Dev 2 owns **messaging audit, Message Owner/Requester flows, I Have This Game flow, conversation creation, conversation deduplication, and Firestore messaging (if feasible)**. Do **not** modify listing Firestore CRUD or Dev 3 auth/routing unless coordinating on `ListingDetailPage` CTA handlers only.

---

# Current Status

## Messaging UI — complete

| Area | Status | Evidence |
|------|--------|----------|
| Inbox page | **Complete** | `InboxPage.tsx` — conversation list, empty state |
| Chat page | **Complete** | `ChatPage.tsx`, `ChatWindow`, `MessageBubble`, `MessageInput` |
| Messages context | **Complete** | `MessagesContext.tsx` — load conversations/messages, send message |
| Protected routes | **Complete** | `/inbox`, `/inbox/:conversationId` behind `ProtectedRoute` |
| Send message (dev backend) | **Complete** | Persists to localStorage; survives refresh in same browser |
| Seed conversations | **Complete** | `mockMessages.seed.ts` for first-load demo |
| Service layer boundary | **Complete** | Pages/context call `messageService.ts` only — no Firebase in UI |

## Messaging backend — not production-ready

| Area | Status | Evidence |
|------|--------|----------|
| Firestore messaging | **Not implemented** | No `messageService.firestore.ts`; router always uses dev backend (QA-005) |
| Cross-account messaging | **Not working** | localStorage keys `gameshelf_conversations`, `gameshelf_messages` — per-browser only (QA-110) |
| `createConversation` in context | **Not exposed** | Exists in `messageService.ts` but not on `MessagesContext` (QA-104) |
| Conversation deduplication | **Not implemented** | `devCreateConversation` always creates new thread (QA-105) |
| Participant display names | **Placeholder** | Hardcoded `'Recipient'` in dev backend (QA-105) |
| Listing detail CTAs (signed-in) | **Not wired** | Buttons call `useRequireAuth()` only — guests go to login; **logged-in users get no-op** (QA-001 partial) |
| Firestore rules for conversations/messages | **Not done** | Dev 2 adds when Firestore backend ships |
| Real-time updates | **Not implemented** | `subscribeToMessages` does one-time fetch in dev mode |

## Related changes by other developers (context only)

| Area | Owner | Status |
|------|-------|--------|
| Guest → login on Message/Request CTAs | Dev 3 | **Complete** — `useRequireAuth()` on `ListingDetailPage` |
| Guest browse (public listing detail) | Dev 3 | **Complete** — non-owners see CTAs; auth required to proceed |
| Listing detail mock reviews removed | Dev 3 | **Complete** — no longer blocks messaging UX |

---

# Remaining Critical Tasks

## D2-C1 — Team decision: Firestore messaging vs demo-only (QA-005, D2-008)

**Problem:** Sprint acceptance expects cross-user messaging. Current backend cannot satisfy two-browser QA.

**Decision required (document in README or sprint note):**

| Option | When to choose | Minimum deliverable |
|--------|----------------|---------------------|
| **A — Ship Firestore messaging** | Required for full cross-user demo | D2-C2 through D2-C6 |
| **B — Demo-only localStorage** | Time-constrained; explicit team sign-off | Wire CTAs to dev backend + in-app banner on Inbox: “Messaging demo — single browser only” |

**Owner:** Dev 2 leads recommendation; team confirms before Week 2.

---

## D2-C2 — Wire listing detail CTAs for signed-in users (QA-001, QA-104)

**Problem:** “Request Game”, “Message Owner”, “I have this game”, “Message requester” redirect guests to login but do **nothing** when already signed in.

**Work (minimum — works with dev backend first):**
- Extend `MessagesContext` with `createConversation(input)` wrapping `messageService.createConversation`.
- On `ListingDetailPage` (coordinate with Dev 3 — handler only, no routing changes):
  - **Message Owner** / **Message requester:** `createConversation({ listingId, recipientId: listing.ownerId })` → navigate to `ROUTES.chat(conversationId)` → refresh inbox.
  - **Request Game** / **I have this game:** same thread creation (initial message optional) or documented equivalent — product decision: both start a conversation about the listing.
- Preserve guest behavior: `requireAuth(() => startConversation())` pattern.

**Files:** `MessagesContext.tsx`, `ListingDetailPage.tsx` (CTA handlers only), optionally thin helper in `src/utils/` or page-local function.

**Do not:** rewrite `messageService.dev.ts` architecture unless fixing dedup (D2-C3).

---

## D2-C3 — Conversation deduplication (QA-105)

**Problem:** Repeated clicks on Message Owner create duplicate inbox rows.

**Work:**
- Before creating, find existing conversation with same `listingId` and same two participant IDs (order-independent).
- Return existing conversation id if found.
- Apply in dev backend now; mirror logic in Firestore backend when implemented.

**Files:** `messageService.dev.ts`; future `messageService.firestore.ts`

---

## D2-C4 — Resolve participant display names (QA-105, QA-106)

**Problem:** Inbox shows `'Recipient'` instead of listing owner/requester name.

**Work:**
- Resolve name from `listing.ownerName` on create, or `userService.getProfile(recipientId)`.
- Store denormalized `participantNames` on conversation for inbox display.
- Update seed resolution if needed.

**Files:** `messageService.dev.ts`, `conversationDisplay.ts`, types if needed.

---

## D2-C5 — Implement `messageService.firestore.ts` (if Option A — QA-005)

**Problem:** No Firestore persistence for conversations or messages.

**Work:**
- Create `messageService.firestore.ts` with:
  - `fetchConversations` — query where current user is participant
  - `fetchMessages` — query by `conversationId`
  - `sendMessage` — add message doc + update conversation `lastMessageText` / `lastMessageAt`
  - `createConversation` — with dedup (D2-C3)
- Update `messageService.ts` router to use Firestore when configured (mirror listings pattern or always Firestore for final app — team choice).
- Collection names from `firebaseCollections.ts`.

**Files:** `messageService.firestore.ts`, `messageService.ts`, `firebaseCollections.ts`

**Do not:** import Firebase in pages or context beyond existing service boundary.

---

## D2-C6 — Firestore rules for conversations and messages (if Option A)

**Work:**
- Add rules: only participants can read/write their threads.
- Authenticated users can create conversations where they are a participant.
- Coordinate single `firestore.rules` PR with Dev 1 (listings) and Dev 3 (users).

**Files:** `firestore.rules` (Dev 2 section)

---

# Remaining Major Tasks

## D2-M1 — Cross-account messaging QA (QA-007, QA-110)

- Account A creates listing; Account B clicks Message Owner → sends message.
- Account A sees thread in inbox after refresh (Firestore mode).
- Document failure mode if staying on localStorage backend.

## D2-M2 — Inbox UX after conversation create

- Ensure new thread appears in inbox without manual full page reload (call `refreshConversations` after create).
- Optional: unread count / last message preview accuracy.

## D2-M3 — Messaging audit cleanup (QA-206)

- `src/messaging.css` — orphan file, not imported; delete or integrate intentionally.
- Remove stale FIREBASE TODOs in messaging paths once Firestore ships or scope is documented.

## D2-M4 — `subscribeToMessages` improvement

- If time: Firestore `onSnapshot` for active chat thread.
- Otherwise document one-time fetch as acceptable for submission.

## D2-M5 — Dev backend banner (Option B only)

- Visible notice on `InboxPage` when using localStorage backend.
- Demo script updated in [E2E_TEST_PLAN.md](./E2E_TEST_PLAN.md).

---

# Out of Scope

| Item | Owner / notes |
|------|----------------|
| Firestore listings rules, Storage rules, listing CRUD | Dev 1 |
| Guest browsing, public routes, `useRequireAuth` | Dev 3 — **complete** |
| Search, listing detail layout, mock profile stats | Dev 3 |
| Auth/signup/analytics hardening | Dev 3 |
| Firebase Hosting deploy | Dev 3 |
| Real-time feed/listings `onSnapshot` | Future |
| Push notifications, read receipts, typing indicators | Future |
| Message search, attachments, blocking | Future |
| Rewriting `AuthContext` or adding second auth listener | Forbidden per architecture rules |
| Deep refactor of `messageService.dev.ts` beyond dedup + names | Avoid scope creep |

---

# Testing Checklist

## Signed-in CTA wiring (required regardless of backend)

- [ ] Signed-in user on **another user’s offer** → **Message Owner** → lands in chat thread
- [ ] Signed-in user on **another user’s offer** → **Request Game** → meaningful action (conversation or documented behavior)
- [ ] Signed-in user on **request listing** → **I have this game** → opens/creates thread
- [ ] Signed-in user on **request listing** → **Message requester** → lands in chat
- [ ] **Guest** on listing detail → any CTA → `/login` with return path → after login, can complete action
- [ ] **Owner** viewing own listing → no Message/Request CTAs for self (unchanged)

## Conversation deduplication

- [ ] Message Owner twice on same listing → **one** inbox row (same conversation id)

## Inbox and chat (single browser — dev backend)

- [ ] Inbox lists conversations with correct other participant name (not `'Recipient'`)
- [ ] Open thread → messages load
- [ ] Send message → appears in thread; persists after refresh
- [ ] Empty message → validation error, not sent

## Cross-account (Firestore backend — if Option A)

- [ ] Account B sends message on A’s listing
- [ ] Account A sees message in inbox after refresh (different browser or incognito)
- [ ] Account C cannot read A↔B thread (rules test via Console or denied client)

## Regression

- [ ] `npm run build` passes
- [ ] Existing seed conversations still load for dev
- [ ] Protected routes: guest cannot access `/inbox` directly without login redirect

---

# Definition of Done

Dev 2’s final-project work is **done** when:

1. **No silent dead CTAs:** Every listing-detail messaging action either performs a real flow or shows explicit disabled state with explanation (prefer real flow).
2. **`MessagesContext` exposes `createConversation`** and listing detail uses it for signed-in users.
3. **Deduplication works:** Same listing + same two users → one conversation.
4. **Inbox labels** show real participant names (from listing or profile).
5. **Team decision documented:** Firestore messaging shipped **or** demo-only mode explicitly disclosed in UI/docs.
6. **If Firestore option chosen:** Two-account message round-trip persists after refresh; rules deployed; `messageService.ts` routes to Firestore.
7. **If demo-only option chosen:** CTAs work in single-browser dev mode; Inbox banner + demo script warn evaluators; cross-user limitation documented.
8. **`npm run build` passes**; no Firebase imports added to UI components.

---

## Key files (reference)

| File | Role |
|------|------|
| `src/services/messageService.ts` | Public API — **add Firestore router here** |
| `src/services/messageService.dev.ts` | localStorage backend — dedup + names |
| `src/context/MessagesContext.tsx` | **Add createConversation** |
| `src/pages/ListingDetailPage.tsx` | CTA handlers (coordinate with Dev 3) |
| `src/pages/InboxPage.tsx` | Inbox UI |
| `src/pages/ChatPage.tsx` | Chat UI |
| `src/types/message.ts` | Conversation, Message types |
| `src/config/firebaseCollections.ts` | Collection names |
| `firestore.rules` | Conversations/messages rules (if Firestore) |

---

## Suggested implementation order

1. D2-C1 decision (Day 1)
2. D2-C2 + D2-C4 on dev backend (quick win for demo)
3. D2-C3 deduplication
4. D2-C5 + D2-C6 if Firestore feasible
5. D2-M1 cross-account QA

---

*Last updated: June 2026 — regenerated from QA audit and current codebase. Supersedes Sprint 1 messaging doc that treated UI as in-progress.*
