/**
 * Listings storage backend selector.
 *
 * - `local` (default): localStorage + seed data via listingService.dev.ts
 * - `firestore`: Firestore only — dev/localStorage paths are disabled
 *
 * Set in `.env`:
 *   VITE_LISTINGS_BACKEND=firestore
 *
 * See docs/FIREBASE_INTEGRATION.md → "Listings backend migration".
 */

export type ListingsBackend = 'local' | 'firestore'

const raw = import.meta.env.VITE_LISTINGS_BACKEND ?? 'local'

export const LISTINGS_BACKEND: ListingsBackend =
  raw === 'firestore' ? 'firestore' : 'local'

export function isFirestoreListingsBackend(): boolean {
  return LISTINGS_BACKEND === 'firestore'
}

export function isLocalListingsBackend(): boolean {
  return LISTINGS_BACKEND === 'local'
}

/** Throws when dev/localStorage code is reached while Firestore mode is active. */
export function assertLocalListingsBackend(caller: string): void {
  if (isFirestoreListingsBackend()) {
    throw new Error(
      `[listings] ${caller} uses the local dev backend, but VITE_LISTINGS_BACKEND=firestore. ` +
        'Implement Firestore in listingService.firestore.ts instead.',
    )
  }
}
