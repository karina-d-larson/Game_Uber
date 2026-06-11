/**
 * LOCAL DEV BACKEND — localStorage + seed data only.
 *
 * Active when VITE_LISTINGS_BACKEND=local (default).
 * This module MUST NOT run when VITE_LISTINGS_BACKEND=firestore.
 *
 * FIREBASE TODO: delete this file after Firestore migration is verified.
 */
import { mockListings } from '../data/mockListings.seed'
import type { Listing } from '../types/listing'
import { assertLocalListingsBackend } from '../config/listingsBackend'
import { normalizeListings } from '../utils/listingNormalize'
import { readJson, writeJson } from '../utils/localStorage'

export const DEV_LISTINGS_STORAGE_KEY = 'boardlink_listings'

export async function devFetchListings(): Promise<Listing[]> {
  assertLocalListingsBackend('devFetchListings')

  const saved = readJson<unknown>(DEV_LISTINGS_STORAGE_KEY)
  if (Array.isArray(saved) && saved.length > 0) {
    return normalizeListings(saved)
  }
  return mockListings
}

export async function devSaveListings(listings: Listing[]): Promise<void> {
  assertLocalListingsBackend('devSaveListings')
  writeJson(DEV_LISTINGS_STORAGE_KEY, listings)
}

/** Optional: call once after switching to Firestore to drop stale dev data. */
export function devClearListingsStorage(): void {
  localStorage.removeItem(DEV_LISTINGS_STORAGE_KEY)
}
