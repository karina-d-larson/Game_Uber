/**
 * FIREBASE — Authentication (teammate implements)
 * ================================================
 * Docs: docs/FIREBASE_INTEGRATION.md (Milestone 2)
 *
 * Suggested exports:
 *   - signUp(email, password, displayName)
 *   - signIn(email, password)
 *   - signOut()
 *   - subscribeToAuth(callback) → unsubscribe
 *   - getCurrentUserId(): string | null
 *
 * After Auth works:
 *   - Create src/context/AuthContext.tsx
 *   - Wrap app in App.tsx (inside or outside ListingsProvider)
 *   - Guard /listings/new so only signed-in users can post
 *   - Use uid in listingService.createListing for ownerId
 *
 * Do NOT import Firebase in page components — only here and src/lib/firebase.ts
 */

export {}
