/**
 * LISTING DATA LAYER — public CRUD API (backend selected by VITE_LISTINGS_BACKEND)
 * ================================================================================
 * Guide: docs/FIREBASE_INTEGRATION.md
 *
 * UI: useListings() / listingService only — no Firestore in pages/components.
 *
 * Backends:
 *   local     → listingService.dev.ts (localStorage + seed)
 *   firestore → listingService.firestore.ts (implement Firestore here)
 */

import type {
  CreateListingInput,
  ExchangeOption,
  Listing,
  UpdateListingInput,
} from '../types/listing'
import { isFirestoreListingsBackend } from '../config/listingsBackend'
import {
  listingPurposeToListingType,
  normalizeOfferArrangement,
  normalizeRequestOptions,
  normalizeTutorialUrl,
  normalizeListingCategories,
  categoriesFromInput,
  resolvePurposeFields,
  toListingPurpose,
} from '../utils/listingMapping'
import { formatListingPrice } from '../utils/listingPricing'
import { getCurrentUser } from './authService'
import * as devListings from './listingService.dev'
import * as firestoreListings from './listingService.firestore'
import * as storageService from './storageService'

function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `listing-${Date.now()}`
}

function resolvePrice(
  arrangementType: ExchangeOption | undefined,
  pricePerDay: number | undefined,
  existingPrice?: string,
): string | undefined {
  const formatted = formatListingPrice(arrangementType, pricePerDay)
  return formatted ?? existingPrice
}

// ---------------------------------------------------------------------------
// Firestore document → Listing (used by listingService.firestore.ts on reads)
// ---------------------------------------------------------------------------
export function mapDocToListing(
  id: string,
  data: Record<string, unknown>,
): Listing {
  const createdAtRaw = data.createdAt
  const createdAt =
    typeof createdAtRaw === 'number'
      ? createdAtRaw
      : typeof createdAtRaw === 'object' &&
          createdAtRaw !== null &&
          'toMillis' in createdAtRaw &&
          typeof (createdAtRaw as { toMillis: () => number }).toMillis === 'function'
        ? (createdAtRaw as { toMillis: () => number }).toMillis()
        : Date.now()

  const updatedAtRaw = data.updatedAt
  const updatedAt =
    typeof updatedAtRaw === 'number'
      ? updatedAtRaw
      : typeof updatedAtRaw === 'object' &&
          updatedAtRaw !== null &&
          'toMillis' in updatedAtRaw &&
          typeof (updatedAtRaw as { toMillis: () => number }).toMillis === 'function'
        ? (updatedAtRaw as { toMillis: () => number }).toMillis()
        : createdAt

  const listingPurpose = toListingPurpose(data.listingPurpose, data.listingType)
  const listingType = listingPurposeToListingType(listingPurpose)

  const arrangementType =
    listingPurpose === 'offer'
      ? normalizeOfferArrangement(data.arrangementType)
      : undefined

  const requestOptions =
    listingPurpose === 'request'
      ? normalizeRequestOptions(data.requestOptions, data.arrangementType)
      : undefined

  const { categories, category } = normalizeListingCategories(
    data.categories,
    data.category,
  )

  return {
    id,
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
    listingPurpose,
    listingType,
    category,
    categories: categories.length > 0 ? categories : undefined,
    ownerId: String(data.ownerId ?? ''),
    ownerName: String(data.ownerName ?? ''),
    createdAt,
    updatedAt,
    condition: String(data.condition ?? ''),
    availability: data.availability === 'unavailable' ? 'unavailable' : 'available',
    arrangementType,
    requestOptions,
    price: typeof data.price === 'string' ? data.price : undefined,
    pricePerDay:
      listingPurpose === 'offer' && typeof data.pricePerDay === 'number'
        ? data.pricePerDay
        : undefined,
    location: typeof data.location === 'string' ? data.location : undefined,
    meetupPreferences:
      typeof data.meetupPreferences === 'string' ? data.meetupPreferences : undefined,
    tutorialUrl:
      listingPurpose === 'offer' && typeof data.tutorialUrl === 'string'
        ? normalizeTutorialUrl(data.tutorialUrl, 'offer')
        : undefined,
  }
}

// ---------------------------------------------------------------------------
// Public API — routes to active backend (local vs firestore)
// ---------------------------------------------------------------------------

export async function fetchListings(): Promise<Listing[]> {
  if (isFirestoreListingsBackend()) {
    return firestoreListings.fetchListings()
  }
  return devListings.devFetchListings()
}

export async function getListingById(id: string): Promise<Listing | undefined> {
  if (isFirestoreListingsBackend()) {
    return firestoreListings.getListingById(id)
  }
  const listings = await devListings.devFetchListings()
  return listings.find((listing) => listing.id === id)
}

export async function createListing(
  input: CreateListingInput,
): Promise<Listing> {
  if (isFirestoreListingsBackend()) {
    return firestoreListings.createListing(input)
  }

  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('You must be signed in to create a listing.')
  }

  const listingId = generateId()
  const now = Date.now()

  const imageUrls =
    input.imageFiles.length > 0
      ? await Promise.all(
          input.imageFiles.map((file) =>
            storageService.uploadListingImage(file, currentUser.id, listingId),
          ),
        )
      : []

  const purposeFields = resolvePurposeFields(input)
  const categoryFields = categoriesFromInput(input)

  const listing: Listing = {
    id: listingId,
    title: input.title.trim(),
    description: input.description.trim(),
    imageUrls,
    listingPurpose: purposeFields.listingPurpose,
    listingType: purposeFields.listingType,
    category: categoryFields.category,
    categories: categoryFields.categories,
    ownerId: currentUser.id,
    ownerName: currentUser.displayName,
    createdAt: now,
    updatedAt: now,
    condition: input.condition.trim(),
    availability: input.availability,
    arrangementType: purposeFields.arrangementType,
    requestOptions: purposeFields.requestOptions,
    pricePerDay:
      purposeFields.listingPurpose === 'offer' &&
      purposeFields.arrangementType === 'rent'
        ? input.pricePerDay
        : undefined,
    price:
      purposeFields.listingPurpose === 'offer'
        ? resolvePrice(purposeFields.arrangementType, input.pricePerDay)
        : undefined,
    location: input.location?.trim(),
    meetupPreferences: input.meetupPreferences?.trim(),
    tutorialUrl: normalizeTutorialUrl(input.tutorialUrl, purposeFields.listingPurpose),
  }

  const listings = await devListings.devFetchListings()
  await devListings.devSaveListings([listing, ...listings])
  return listing
}

export async function updateListing(
  id: string,
  input: UpdateListingInput,
): Promise<Listing> {
  if (isFirestoreListingsBackend()) {
    return firestoreListings.updateListing(id, input)
  }

  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('You must be signed in to update a listing.')
  }

  const listings = await devListings.devFetchListings()
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

  const purposeFields = resolvePurposeFields({
    listingPurpose: input.listingPurpose ?? existing.listingPurpose,
    listingType: input.listingType ?? existing.listingType,
    arrangementType: input.arrangementType ?? existing.arrangementType,
    requestOptions: input.requestOptions ?? existing.requestOptions,
  })

  const arrangementType = purposeFields.arrangementType
  const requestOptions = purposeFields.requestOptions
  const pricePerDay =
    purposeFields.listingPurpose === 'offer' && arrangementType === 'rent'
      ? input.pricePerDay !== undefined
        ? input.pricePerDay
        : existing.pricePerDay
      : undefined

  const tutorialUrl =
    purposeFields.listingPurpose === 'offer'
      ? input.tutorialUrl !== undefined
        ? normalizeTutorialUrl(input.tutorialUrl, 'offer')
        : existing.tutorialUrl
      : undefined

  const categoryFields =
    input.categories != null || input.category != null
      ? categoriesFromInput({
          categories: input.categories ?? existing.categories,
          category: input.category ?? existing.category,
        })
      : {
          categories: existing.categories ?? normalizeListingCategories(undefined, existing.category).categories,
          category: existing.category,
        }

  const updated: Listing = {
    ...existing,
    title: input.title != null ? input.title.trim() : existing.title,
    description:
      input.description != null ? input.description.trim() : existing.description,
    category: categoryFields.category,
    categories: categoryFields.categories.length > 0 ? categoryFields.categories : undefined,
    listingPurpose: purposeFields.listingPurpose,
    listingType: purposeFields.listingType,
    condition: input.condition != null ? input.condition.trim() : existing.condition,
    availability: input.availability ?? existing.availability,
    imageUrls,
    arrangementType,
    requestOptions,
    pricePerDay,
    price:
      purposeFields.listingPurpose === 'offer'
        ? resolvePrice(arrangementType, pricePerDay, existing.price)
        : undefined,
    location: input.location != null ? input.location.trim() : existing.location,
    meetupPreferences:
      input.meetupPreferences != null
        ? input.meetupPreferences.trim()
        : existing.meetupPreferences,
    tutorialUrl,
    updatedAt: Date.now(),
  }

  const next = listings.map((l) => (l.id === id ? updated : l))
  await devListings.devSaveListings(next)
  return updated
}

export async function deleteListing(id: string): Promise<void> {
  if (isFirestoreListingsBackend()) {
    return firestoreListings.deleteListing(id)
  }

  const currentUser = getCurrentUser()
  if (!currentUser) {
    throw new Error('You must be signed in to delete a listing.')
  }

  const listings = await devListings.devFetchListings()
  const existing = listings.find((l) => l.id === id)
  if (!existing) throw new Error('Listing not found.')

  if (existing.ownerId !== currentUser.id) {
    throw new Error('You can only delete your own listings.')
  }

  const next = listings.filter((l) => l.id !== id)
  await devListings.devSaveListings(next)
}
