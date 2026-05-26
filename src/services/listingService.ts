/**
 * LISTING DATA LAYER — swap implementation here for Firebase
 * ===========================================================
 * Guide: docs/FIREBASE_INTEGRATION.md
 *
 * UI must NOT import Firestore directly. Pages use:
 *   - useListings() from src/context/ListingsContext.tsx
 *   - OR getListingById() from src/data/listings.ts (detail page Phase 1 only)
 *
 * YOUR TASKS (Firestore):
 *   1. fetchListings()     → query collection `listings` (see firebaseCollections.ts)
 *   2. getListingById(id)  → getDoc or query by document id
 *   3. createListing()     → addDoc + ownerId from authService + image from storageService
 *   4. map Firestore docs  → Listing type (src/types/listing.ts)
 *
 * Optional: real-time updates via onSnapshot in ListingsContext.refreshListings
 *
 * DEV FALLBACK: localStorage + mockListings below — remove when Firestore is live.
 */

import { mockListings } from '../data/listings'
import type { CreateListingInput, Listing, UpdateListingInput } from '../types/listing'
import { readJson, writeJson } from '../utils/localStorage'
import { getCurrentUser } from './authService'
import * as storageService from './storageService'

const STORAGE_KEY = 'boardlink_listings'

function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `listing-${Date.now()}`
}

// ---------------------------------------------------------------------------
// FIREBASE TODO: map Firestore document → Listing (use after you add Firestore)
// ---------------------------------------------------------------------------
// import type { DocumentData } from 'firebase/firestore'
// export function mapDocToListing(id: string, data: DocumentData): Listing {
//   return {
//     id,
//     title: data.title,
//     category: data.category,
//     // ...see docs/FIREBASE_INTEGRATION.md for full field list
//     owner: {
//       name: data.ownerName,
//       rating: data.ownerRating,
//       avatar: data.ownerAvatar,
//     },
//     // ...
//   }
// }

async function saveListings(listings: Listing[]): Promise<void> {
  // DEV FALLBACK only. FIREBASE TODO: replace with per-document writes.
  writeJson(STORAGE_KEY, listings)
}

/**
 * FIREBASE TODO: replace body with getDocs(collection(db, 'listings'))
 * Keep return type Promise<Listing[]>. Dashboard will use this via ListingsContext.
 */
export async function fetchListings(): Promise<Listing[]> {
  // FIREBASE TODO: add pagination support (limit/cursor) for scaling.
  // FIREBASE TODO: add server-side query filters for listingType/category/availability.
  const saved = readJson<Listing[]>(STORAGE_KEY)
  if (saved && saved.length > 0) return saved
  return mockListings
}

/**
 * FIREBASE TODO: replace with getDoc(doc(db, 'listings', id)) + mapDocToListing
 */
export async function getListingById(id: string): Promise<Listing | undefined> {
  const listings = await fetchListings()
  return listings.find((listing) => listing.id === id)
}

/**
 * Create a listing.
 *
 * FIREBASE TODO (teammate):
 * - Upload images via storageService (download URLs)
 * - Add doc to `listings/{listingId}`
 * - Set `ownerId` from current auth user
 */
export async function createListing(
  input: CreateListingInput,
): Promise<Listing> {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    throw new Error('You must be signed in to create a listing.')
  }

  if (input.imageFiles.length === 0) {
    throw new Error('Please add at least one image.')
  }

  const listingId = generateId()
  const createdAt = Date.now()

  const imageUrls = await Promise.all(
    input.imageFiles.map((file) =>
      storageService.uploadListingImage(file, currentUser.id, listingId),
    ),
  )

  const listing: Listing = {
    id: listingId,
    title: input.title.trim(),
    description: input.description.trim(),
    imageUrls,
    listingType: input.listingType,
    category: input.category.trim(),
    ownerId: currentUser.id,
    ownerName: currentUser.displayName,
    createdAt,
    condition: input.condition.trim(),
    availability: input.availability,

    // Optional legacy fields (if the form provides them)
    arrangementType: input.arrangementType,
    pricePerDay: input.pricePerDay,
    location: input.location,
    meetupPreferences: input.meetupPreferences,
  }

  const listings = await fetchListings()
  const next = [listing, ...listings]
  await saveListings(next)
  return listing
}

export async function updateListing(
  id: string,
  input: UpdateListingInput,
): Promise<Listing> {
  // FIREBASE TODO: enforce ownership and mutable fields with Firestore Security Rules.
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    throw new Error('You must be signed in to update a listing.')
  }

  const listings = await fetchListings()
  const existing = listings.find((l) => l.id === id)
  if (!existing) throw new Error('Listing not found.')

  if (existing.ownerId !== currentUser.id) {
    throw new Error('You can only edit your own listings.')
  }

  const imageUrls =
    input.imageFiles && input.imageFiles.length > 0
      ? await Promise.all(
          input.imageFiles.map((file) =>
            storageService.uploadListingImage(file, currentUser.id, id),
          ),
        )
      : existing.imageUrls

  const updated: Listing = {
    ...existing,

    title: input.title != null ? input.title.trim() : existing.title,
    description:
      input.description != null ? input.description.trim() : existing.description,
    category: input.category != null ? input.category.trim() : existing.category,

    listingType: input.listingType ?? existing.listingType,
    condition: input.condition != null ? input.condition.trim() : existing.condition,
    availability: input.availability ?? existing.availability,

    imageUrls,

    // Optional legacy fields
    arrangementType: input.arrangementType ?? existing.arrangementType,
    pricePerDay: input.pricePerDay ?? existing.pricePerDay,
    location: input.location ?? existing.location,
    meetupPreferences: input.meetupPreferences ?? existing.meetupPreferences,
  }

  const next = listings.map((l) => (l.id === id ? updated : l))
  await saveListings(next)
  return updated
}

export async function deleteListing(id: string): Promise<void> {
  // FIREBASE TODO: optionally delete Storage files under listings/{ownerId}/{listingId}/.
  // Authorization must still be enforced by Firestore rules.
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    throw new Error('You must be signed in to delete a listing.')
  }

  const listings = await fetchListings()
  const existing = listings.find((l) => l.id === id)
  if (!existing) throw new Error('Listing not found.')

  if (existing.ownerId !== currentUser.id) {
    throw new Error('You can only delete your own listings.')
  }

  const next = listings.filter((l) => l.id !== id)
  await saveListings(next)
}
