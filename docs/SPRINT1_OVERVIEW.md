# Sprint 1 Overview — BoardLink

**Duration:** 2 weeks  
**Team size:** 3 developers  
**Product:** BoardLink — React + Tailwind + Firebase board game lending/renting marketplace

---

## Sprint 1 goal

By the end of Sprint 1, BoardLink should feel like a **real, usable product foundation**:

- User account flow works (sign up, log in, log out)
- Profiles and settings are stored in Firebase and survive refresh
- Listings are **shared** through Firestore (not one browser’s localStorage)
- Users can message listing owners and messages **persist**
- Core data survives hard refresh
- Major broken buttons are **fixed or hidden** — no dead UI

---

## Developer assignments

| Developer | Sprint doc | Primary ownership |
|-----------|------------|-------------------|
| **Dev 1** | [SPRINT1_DEV1_FIREBASE_LISTINGS.md](./SPRINT1_DEV1_FIREBASE_LISTINGS.md) | Firestore listings CRUD, listing rules, free image strategy, hosting research |
| **Dev 2** | [SPRINT1_DEV2_MESSAGING.md](./SPRINT1_DEV2_MESSAGING.md) | Message Owner, Firestore conversations/messages, inbox + chat persistence |
| **Dev 3** | [SPRINT1_DEV3_PROFILE_AUTH.md](./SPRINT1_DEV3_PROFILE_AUTH.md) | Profile/settings, Google login, change password, follow system, wording + button audit |

Each developer should read this overview first, then **only their sprint doc** for day-to-day tasks.

---

## Shared architecture rules

These apply to **all three developers**:

1. **No Firebase in UI** — pages and components call **services** or **contexts**, not `firebase/firestore` or `firebase/auth` directly.
2. **Do not rewrite `AuthContext`** or add a **second auth listener**. Use `authService.subscribeToAuthChanges` as the single session source.
3. **Do not rewrite the public API of `listingService.ts`** — implement Firestore behind the existing router (`local` vs `firestore`).
4. **Do not delete** `listingService.dev.ts` or `messageService.dev.ts` until Firestore paths are tested and verified.
5. **Firebase Storage is deferred** for Sprint 1 (stay on free plan). Use placeholders, external URLs, or limited data-URL fallbacks — see Dev 1 and Dev 3 image strategy sections.
6. **Use Firestore** for shared app data (listings, users, conversations, messages, follows).
7. **Coordinate before editing** files listed under “Cross-team conflict warnings” below.
8. **Small PRs** — one feature area per PR when possible.

**Reference docs (schemas and setup — not task lists):**

- [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md) — collection schemas, env vars, architecture boundaries
- [APP_ARCHITECTURE.md](./APP_ARCHITECTURE.md) — routing, shells, where features attach

**Archived (do not use for tasks):** [FIREBASE_INTEGRATION.md](./FIREBASE_INTEGRATION.md)

---

## Cross-team conflict warnings

These files are touched by multiple developers. **Announce in team chat before editing** or assign one owner per sprint week:

| File | Dev 1 | Dev 2 | Dev 3 |
|------|-------|-------|-------|
| `firestore.rules` | listings rules | messaging rules | users / follows rules |
| `src/pages/ListingDetailPage.tsx` | listing display | **Message Owner** button | follow button (if on detail) |
| `src/routes/AppRouter.tsx` | — | chat routes | settings / following routes |
| `src/routes/paths.ts` | — | inbox/chat | profile/settings/following |
| `src/components/ProfileHeader.tsx` | — | Message button | Follow button, bio |
| `src/services/authService.ts` | `getCurrentUser()` | `getCurrentUser()` | Google login, change password |
| `.env` / `.env.example` | `VITE_LISTINGS_BACKEND` | — | Firebase Auth providers |

**Merge strategy:** Dev 1 owns `firestore.rules` listings section first; Dev 2 adds conversations/messages; Dev 3 adds users/follows. Combine in one rules PR at end of week 2 if needed.

---

## Sprint workflow (recommended)

### Week 1

- Each dev completes “inspect first” checklists in their sprint doc.
- Implement core Firestore/service layer (listings, messaging, profile/preferences).
- Keep `VITE_LISTINGS_BACKEND=local` until Dev 1 verifies Firestore CRUD.
- Daily: run `npm run build` before pushing.

### Week 2

- Integration testing across **two accounts / two browsers**.
- Flip `VITE_LISTINGS_BACKEND=firestore` when Dev 1 signs off.
- Button audit (Dev 3 leads; all devs hide or wire buttons in their areas).
- Wording pass on auth, listings, messaging, settings.
- Hosting research (Dev 1) — decision documented, not necessarily deployed.

---

## End-of-sprint user story checklist

Use this as the **team acceptance test** before calling Sprint 1 done:

- [ ] A user can **sign up**, **log in**, and **log out**.
- [ ] A user can **edit profile/settings** and see changes after **hard refresh**.
- [ ] A user can **create a listing** and **another user can see it** (different browser/account).
- [ ] A user can **open a listing** and **message the owner**; the thread opens with no duplicate conversation for the same listing + participants.
- [ ] A user can **return later** and still see **listings**, **messages**, and **profile** data.
- [ ] A user can **follow** another user and see their **following list** (no “view followers” required).
- [ ] A user can use the app **without encountering dead buttons** (broken actions are hidden or working).
- [ ] **Google/Gmail login** works (Dev 3).
- [ ] **Email/password users** can **change password**; Google-only users do not see a broken change-password flow (Dev 3).

---

## Old TODO docs

The scattered MVP TODO files have been **retired** and replaced by this Sprint 1 set:

- `docs/TODO_FIREBASE_BACKEND.md` → see [SPRINT1_DEV1_FIREBASE_LISTINGS.md](./SPRINT1_DEV1_FIREBASE_LISTINGS.md)
- `docs/TODO_MESSAGING_PROFILE.md` → see [SPRINT1_DEV2_MESSAGING.md](./SPRINT1_DEV2_MESSAGING.md) and [SPRINT1_DEV3_PROFILE_AUTH.md](./SPRINT1_DEV3_PROFILE_AUTH.md)

---

## If confused, check…

1. Your developer-specific sprint doc (task list + “Do not touch”).
2. [APP_ARCHITECTURE.md](./APP_ARCHITECTURE.md) — “Where does this page get data?”
3. [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md) — field names and collection paths.
4. `src/config/firebaseCollections.ts` — canonical collection names.
5. Team chat — before editing a “conflict warning” file.
