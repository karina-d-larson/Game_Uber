# Current bugs

**Superseded by:** [QA_AUDIT_FINAL.md](./QA_AUDIT_FINAL.md) and [FINAL_WORKING_APP_BACKLOG.md](./FINAL_WORKING_APP_BACKLOG.md)

**Last updated:** July 2026

---

## Resolved since May 2026

| Issue | Status |
|-------|--------|
| `npm run build` fails in `messageService.dev.ts` | **Fixed** — build passes |
| Firebase Analytics crash without `.env` | **Fixed** — Analytics removed (Dev 3) |
| Mock profile stats/reviews | **Fixed** — Firestore review MVP (Dev 3) |
| Guest cannot see listings (permission-denied) | **Fixed** — `firestore.rules` deployed; public read for listings/users/reviews |
| Cannot add review for another user | **Fixed** — rules deploy + verified via browser signup → review submit |
| Owner/reviewer names not clickable | **Fixed** — profile links on listing detail + feed cards (`ListingDetailPage`, `ListingCard`) |

---

## Open issues (by owner)

See [FINAL_WORKING_APP_BACKLOG.md](./FINAL_WORKING_APP_BACKLOG.md) for current tasks.

| Area | Owner | Notes |
|------|-------|-------|
| Invalid `firestore.rules` orphan block + listings rules | Dev 1 | **Deployed** — public read + review create rules live on `game-uber` |
| Missing `storage.rules` | Dev 1 | |
| Messaging Firestore / dead signed-in CTAs | Dev 2 | Guests redirect to login; signed-in CTAs unwired |
| Guest Firestore listing read | Dev 1 + Dev 3 | **Resolved** — rules deployed; 5 listings readable as guest (July 2026) |

---

## Final demo notes

- Use `VITE_LISTINGS_BACKEND=firestore` for cross-account listing demo.
- Reviews are real Firestore-backed MVP — submit from listing detail, view on profile.
- Empty feed/inbox is expected when Firestore has no data and `VITE_DEV_SEED_DATA` is not set.
- Optional local seed: `VITE_DEV_SEED_DATA=true` (local backend only).
- Messaging may remain localStorage-only until Dev 2 ships Firestore backend.

---

## How to report a new bug

1. Run the failing command and copy the exact error.
2. Add an entry to [FINAL_WORKING_APP_BACKLOG.md](./FINAL_WORKING_APP_BACKLOG.md) or this file with owner and severity.
3. Notify the team if it blocks others.
