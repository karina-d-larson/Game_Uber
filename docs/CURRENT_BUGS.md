# Current bugs

Known issues blocking builds or core flows. **Check here before debugging something already reported.**

**Last updated:** 2026-05-26

---

## Build failures

### `npm run build` fails — `messageService.dev.ts`

| | |
|---|---|
| **Status** | Open |
| **Owner** | Dev 2 (messaging) |
| **Severity** | High (blocks full production build) |

**Error:**
```
src/services/messageService.dev.ts(84,10): error TS2304: Cannot find name 'CreateConversationInput'.
```

**Cause:** `devCreateConversation` uses `CreateConversationInput` but it is not imported from `src/types/message.ts`. The function body also references `input.participantIds` / `input.participantNames`, which are not on `CreateConversationInput` (that type uses `listingId`, `recipientId`, optional `initialMessage`).

**How to fix:** [SPRINT1_DEV2_MESSAGING.md](./SPRINT1_DEV2_MESSAGING.md) → **§6 Part B — Implement `createConversation`**

1. Import `CreateConversationInput` from `src/types/message.ts` in `messageService.dev.ts`.
2. Finish `devCreateConversation` using the Part B input shape:
   - `listingId`, `recipientId`, optional `initialMessage`
   - Build `participantIds` as `[currentUser.id, input.recipientId]`
   - Set `participantNames` from `getCurrentUser()` + listing owner (denormalized for inbox UI)
   - Dedup: find existing conversation with same `listingId` + both participant ids before creating
3. Wire `messageService.ts` → `createConversation` to call `devCreateConversation` (same section, second checkbox).

**Workaround:** `npm run dev` may still run; do not assume `npm run build` passes until this is fixed.

---

## Runtime / app issues

_None reported yet._

---

## How to add a bug

1. Run the failing command (`npm run build`, `npm run dev`, etc.).
2. Copy the **exact error message**.
3. Add an entry with: status, owner, severity, cause, and **specific fix steps** (file + sprint doc section/checkbox).
4. Tell the team in chat if it blocks others.

**Rule:** If an `npm` command fails outside your sprint scope, log it here — do not edit another teammate’s files to unblock yourself.
