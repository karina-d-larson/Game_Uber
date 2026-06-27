# GameShelf — E2E Test Plan

**Purpose:** Pre-submission test coverage for manual QA and future automation  
**Audit reference:** [QA_AUDIT_FINAL.md](./QA_AUDIT_FINAL.md)  
**Automation status:** **None** — no Playwright, Cypress, or Vitest browser tests in `package.json`

---

# Automation assessment

| Framework | Present? | Notes |
|-----------|----------|-------|
| Playwright | No | Recommended — see [Phase 3 recommendation](#phase-3-playwright-recommendation) |
| Cypress | No | — |
| Vitest / @testing-library | No | — |
| Unit tests | No | No `*.test.ts` / `*.spec.ts` in repo |

**Recommendation:** Add **Playwright** after submission crunch if the team continues development. For this sprint, execute **manual** tests below; automate the top 3–5 flows once Firebase test accounts and stable selectors exist.

---

# Test environment matrix

| Environment | Use for |
|-------------|---------|
| **Local dev** (`npm run dev`) | Fast iteration; messaging localStorage OK |
| **Local + Firestore env** | Two-account listing/profile tests |
| **Production build** (`npm run preview`) | Build verification |
| **Firebase Hosting deploy** | Google auth domains, password reset email, PWA |

### Required preconditions (Firestore demo)

- `.env` with valid `VITE_FIREBASE_*` keys
- `VITE_LISTINGS_BACKEND=firestore`
- Firestore rules deployed (users + listings)
- Storage rules deployed (offer images)
- Two test accounts (email or Google)

---

# Test flows

## 1. Email signup / login / logout

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Type** | Manual (automate later) |
| **Preconditions** | Firebase configured; Email/Password provider enabled |
| **Steps** | 1. Open `/signup`. 2. Create account with unique email + username. 3. Confirm redirect to home/profile. 4. Log out from Settings. 5. Log in at `/login` with same credentials. |
| **Expected** | Account created; `users/{uid}` in Firestore; initials avatar on profile; session persists after refresh; logout clears session and redirects to login. |
| **Known risks** | QA-007 signup Firestore write; QA-006 without `.env` |

---

## 2. Google login (manual)

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Type** | **Manual only** (OAuth popup) |
| **Preconditions** | Google provider enabled; pop-ups allowed; authorized domain if deployed |
| **Steps** | 1. Open `/login`. 2. Click Continue with Google. 3. Complete Google consent. 4. First-time: verify profile created. 5. Sign out and sign in again. |
| **Expected** | Session established; Google photo on profile when available; `users/{uid}` doc created on first sign-in. |
| **Known risks** | Popup blocked; unauthorized domain on deployed URL |

---

## 3. Forgot password (manual)

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Type** | **Manual only** (email inbox) |
| **Preconditions** | Existing email/password account; Firebase email template configured |
| **Steps** | 1. Log out. 2. `/login` → Forgot password? 3. Enter registered email. 4. Submit. 5. Check email and complete reset link. 6. Log in with new password. |
| **Expected** | Success message on submit; reset email received; new password works. |
| **Known risks** | Spam folder; auth domain not authorized on deploy |

---

## 4. Edit profile / settings

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Type** | Manual (good automation candidate) |
| **Preconditions** | Signed in |
| **Steps** | 1. Profile → Settings. 2. Edit profile: change display name, bio, optional avatar URL. 3. Save. 4. Settings: toggle preferences (listing types, show following list). 5. Save preferences. 6. Hard refresh. |
| **Expected** | Profile shows updates; preferences persist; Following link visibility matches toggle. |
| **Known risks** | Firestore rules deny write |

---

## 5. Follow / unfollow user

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Type** | Manual |
| **Preconditions** | Two real accounts; Account B created a listing; Account A signed in |
| **Steps** | 1. Account A opens B’s listing (not own). 2. Click Follow on owner card. 3. Profile → Following. 4. Verify B listed. 5. Unfollow from Following page. |
| **Expected** | Follow toggles; `users/{uidA}.following` updates in Firestore; unfollow removes from list. |
| **Known risks** | QA-102 follow on seed owners fails — **do not use seed listings for this test** |

---

## 6. Create Offer listing

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Type** | Manual (automate later) |
| **Preconditions** | Signed in; backend mode documented |
| **Steps** | 1. Create tab → Offer a game. 2. Fill title, categories, arrangement (rent/trade/borrow). 3. Optional description, tutorial URL. 4. Submit. |
| **Expected** | Listing appears on home feed under Offers; detail page shows correct purpose-specific fields. |
| **Known risks** | Local mode: other browsers won’t see it (QA-107) |

---

## 7. Create Request listing

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Type** | Manual |
| **Preconditions** | Signed in |
| **Steps** | 1. Create → Request a game. 2. Fill title, request options, categories. 3. Confirm no photo upload shown. 4. Submit. |
| **Expected** | Compact card in Requests feed; detail shows request options; no image section. |
| **Known risks** | Same backend mode caveats as Offer |

---

## 8. Upload listing image (Offer)

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Type** | Manual |
| **Preconditions** | `VITE_LISTINGS_BACKEND=firestore`; Storage enabled; `storage.rules` deployed; image ≤ 2 MB JPEG/PNG/WebP |
| **Steps** | 1. Create Offer with one photo. 2. Submit. 3. Open listing detail. 4. Verify HTTPS Storage URL (not base64). 5. Second browser/account: verify image visible. |
| **Expected** | Image in `imageUrls[]`; displays on card and detail. |
| **Known risks** | QA-003 missing rules; local mode stores data URL only |

---

## 9. Browse / filter Offers and Requests

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Type** | Manual (good automation candidate) |
| **Preconditions** | Feed has mix of offers and requests |
| **Steps** | 1. Home → Offers toggle. 2. Search by title. 3. Select category chip. 4. Filter exchange type. 5. Switch to Requests; repeat. |
| **Expected** | Feed filters correctly; empty state when no matches. |
| **Known risks** | Client-side filter only — all listings loaded first |

---

## 10. Message Owner / chat flow

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Type** | Manual |
| **Preconditions** | Signed in; listing owned by another user |
| **Steps** | 1. Open listing detail. 2. Click **Message Owner**. 3. Send message. 4. Inbox → verify thread. 5. Refresh → messages persist. |
| **Expected** | Conversation created; navigates to chat; message in thread. |
| **Actual (current code)** | **FAIL — button has no handler (QA-001).** Workaround: open Inbox directly, use seed thread, send message to verify chat UI only. |
| **Known risks** | QA-005 localStorage only; no cross-browser messaging |

---

## 11. Two-account persistence test

| Field | Value |
|-------|-------|
| **Priority** | P0 |
| **Type** | Manual |
| **Preconditions** | Firestore mode for listings; two browsers/profiles; two accounts |
| **Steps** | 1. Account A creates Offer listing. 2. Account B refreshes home — sees listing. 3. B follows A from listing (optional). 4. B attempts Message Owner (currently broken). 5. A edits profile — B sees updated name on listing if denormalized (may not update until listing refresh). |
| **Expected** | Shared listings; profile/follow work; messaging cross-account (when implemented). |
| **Known risks** | Local backend fails step 2; messaging fails step 4 |

---

## 12. Deployed site smoke test

| Field | Value |
|-------|-------|
| **Priority** | P1 |
| **Type** | Manual |
| **Preconditions** | `npm run build`; `firebase deploy`; authorized domains configured |
| **Steps** | 1. Load deployed URL. 2. SPA routes: `/`, `/login`, `/listings/new`, `/profile`, deep link `/listings/:id`. 3. Google login. 4. Create listing (if Firestore mode in build env). 5. Check console for errors. |
| **Expected** | All routes serve `index.html`; auth works; no white screen. |
| **Known risks** | QA-002/003 deploy failures; env vars baked at build time for Vite |

---

# Priority summary

| Priority | Tests |
|----------|-------|
| **P0** | 1, 4, 6, 7, 9, 10 (workaround), 11 |
| **P1** | 2, 3, 5, 8, 12 |

---

# Phase 3 — Playwright recommendation

**Should Playwright be added?** **Yes — after submission**, or in a follow-up sprint if time allows. Firebase Auth and Google OAuth make full unattended CI hard without test project setup; start with **non-Google** flows locally.

### Minimal setup (do not install until team approves)

**Package:**

```bash
npm install -D @playwright/test
npx playwright install
```

**Scripts to add to `package.json`:**

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

**Suggested config:** `playwright.config.ts` with `baseURL: 'http://localhost:5173'`, `webServer` running `npm run dev`.

### Automate first (highest ROI)

1. **Protected route redirect** — guest visiting `/profile` → `/login`.
2. **Email login happy path** — use dedicated Firebase **test project** + disposable email account (or Auth emulator).
3. **Create Request listing** — no image upload; assert appears in Requests feed.
4. **Dashboard filters** — toggle Offer/Request, assert URL/card count changes.
5. **Settings preferences save** — toggle checkbox, reload, assert state (requires Firestore or mock).

### Do not automate first

- Google OAuth popup (use manual test 2)
- Forgot password email link (use manual test 3)
- Two-browser messaging (until Firestore messaging ships)
- Storage upload (until `storage.rules` stable)

### Firebase / env concerns for automation

- Never commit real credentials; use `.env.test` or CI secrets.
- Prefer **Firebase Auth Emulator** + **Firestore Emulator** for CI to avoid quota and email sends.
- Vite env vars are **build-time** — E2E against Firestore needs `VITE_LISTINGS_BACKEND=firestore` when starting dev server.
- Playwright cannot easily test two Firebase users in one browser profile — use two browser contexts or emulator seeding.

---

# Test execution checklist (submission day)

- [ ] Confirm `npm run build` passes
- [ ] Confirm `.env` and `VITE_LISTINGS_BACKEND` documented for demo
- [ ] Run P0 manual tests 1, 6, 7, 9, 11
- [ ] Script around QA-001 (Message Owner) — show Inbox separately or disclose
- [ ] Hide or disclaim mock reviews/stats (QA-103)
- [ ] Use real-user listings for Follow demo (QA-102)
- [ ] If deploying: run test 12 + authorized domains

---

*No tests were implemented during this planning pass. No packages were installed.*
