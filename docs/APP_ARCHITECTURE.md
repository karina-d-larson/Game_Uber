# BoardLink — App shell & routing architecture

This document describes the React application structure: routing, layouts, navigation, and where future Firebase/messaging features attach.

**Related:** [FIREBASE_REFERENCE.md](./FIREBASE_REFERENCE.md) (schemas, Firebase boundaries) · [SPRINT1_OVERVIEW.md](./SPRINT1_OVERVIEW.md) (current tasks)

---

## Route map

| Path | Access | Shell | Page |
|------|--------|-------|------|
| `/login` | Guest | `AuthLayout` | Login |
| `/signup` | Guest | `AuthLayout` | Signup |
| `/` | Protected | Tab (`AppShellLayout`) | Dashboard / feed |
| `/listings/new` | Protected | Tab | Create listing |
| `/inbox` | Protected | Tab | Inbox |
| `/profile` | Protected | Tab | Profile |
| `/listings/:id` | Protected | Stack (`StackShellLayout`) | Listing detail |
| `/listings/:id/edit` | Protected | Stack | Edit listing |
| `/inbox/:conversationId` | Protected | Stack | Chat thread |
| `*` | Any | — | Not found |

Route constants live in **`src/routes/paths.ts`** (`ROUTES`).

Router definition: **`src/routes/AppRouter.tsx`**.

---

## Protected route flow

```
App
 └─ AuthProvider
     └─ ListingsProvider
         └─ BrowserRouter (AppRouter)
             └─ AuthGate          ← splash while session restores
                 ├─ GuestRoute    ← redirect authed users away from login/signup
                 │   └─ AuthLayout
                 └─ ProtectedRoute ← redirect guests to /login with { from }
                     ├─ AppShellLayout + BottomNav
                     └─ StackShellLayout (no bottom nav)
```

1. **`AuthGate`** — shows `AuthSplashPage` until `authService.getCurrentUser()` finishes (Firebase: `onAuthStateChanged`).
2. **`GuestRoute`** — if signed in, redirects to `state.from` or home.
3. **`ProtectedRoute`** — if signed out, redirects to `/login` with `state: { from: fullPath }`.
4. After login/signup, **`getPostAuthPath()`** (`src/utils/authRedirect.ts`) sends the user back to `from` when safe.

Guards: **`src/routes/guards.tsx`** (re-exported from `src/components/AuthGate.tsx`).

---

## App shell structure

### Tab shell — `AppShellLayout`

Used for primary tabs (Home, Create, Inbox, Profile).

- Fixed **bottom navigation** (`BottomNav`)
- Scrollable content with padding for nav + safe area (`--bottom-nav-height`, `pb-safe`)
- Skip link to `#main-content`

### Stack shell — `StackShellLayout`

Used for drill-in flows without tabs:

- Listing detail
- Edit listing
- Chat thread

Pages provide their own **`PageHeader`** (back affordance, title, actions).

### Page wrapper — `Page`

**`src/components/shell/Page.tsx`** — consistent `<main>` landmark, gutters, max width.

**`src/components/shell/PageHeader.tsx`** — sticky header variants (`feed`, `profile`, `create`, `stack`, `inbox`).

---

## Bottom navigation

**`src/components/BottomNav.tsx`**

| Tab | Route | Icon |
|-----|-------|------|
| Home | `/` | `home` |
| Create | `/listings/new` | `add_box` |
| Inbox | `/inbox` (+ `/inbox/:id` highlights Inbox) | `mail` |
| Profile | `/profile` | `person` |

**FIREBASE TODO:** unread badge on Inbox tab from `messageService`.

---

## Global loading & errors

| Component | Role |
|-----------|------|
| `AuthSplashPage` | Initial session restore |
| `PageLoadingFallback` | Suspense / future lazy routes |
| `RouteErrorFallback` | React Router `errorElement` |
| `NotFoundPage` | Unknown paths (`*`) |
| `EmptyState` | In-page empty data (feed, inbox) |

---

## Future messaging integration

| Area | File | TODO |
|------|------|------|
| Inbox list | `src/pages/InboxPage.tsx` | `messageService.fetchConversations()` |
| Chat thread | `src/pages/ChatPage.tsx` | `onSnapshot` messages, send message |
| Listing detail CTA | `ListingDetailPage.tsx` | Navigate to `ROUTES.chat(id)` |
| Bottom nav | `BottomNav.tsx` | Unread count badge |
| Services | `src/services/messageService.ts` | **create when implementing Milestone 4** |

**Do not implement yet:** push notifications, typing indicators, or social graph features.

---

## Architecture rules

- **Pages** compose `Page` + `PageHeader`; avoid duplicating `min-h-dvh` / `pb-24` padding.
- **Navigation paths** use `ROUTES` from `src/routes/paths.ts`.
- **Auth** stays in `AuthContext` + `authService` — guards only read `useAuth()`.
- **Listings** stay in `ListingsContext` + `listingService` — no Firestore in UI.
- **Layouts** own shell chrome; **pages** own feature content.

---

## File index

```
src/
  routes/
    paths.ts          Route constants
    guards.tsx        AuthGate, GuestRoute, ProtectedRoute
    AppRouter.tsx     Route tree
  layouts/
    AppShellLayout.tsx
    StackShellLayout.tsx
    AuthLayout.tsx
  components/
    shell/Page.tsx
    shell/PageHeader.tsx
    BottomNav.tsx
    navigation/PageLoadingFallback.tsx
    errors/RouteErrorFallback.tsx
  pages/              Feature screens
```
