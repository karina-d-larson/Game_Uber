/**
 * Generic localStorage helpers.
 * Listing persistence: src/services/listingService.ts (TEMP — remove when Firestore is live).
 * Firebase teammate: docs/FIREBASE_INTEGRATION.md
 */

export function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}
