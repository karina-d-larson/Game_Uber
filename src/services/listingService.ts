import { mockListings } from '../data/listings'
import type { CreateListingInput, Listing, UpdateListingInput } from '../types/listing'
import { readJson, writeJson } from '../utils/localStorage'
import { auth } from '../lib/firebase'
import * as storageService from './storageService'

const STORAGE_KEY = 'boardlink_listings'

function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `listing-${Date.now()}`
}

async function saveListings(listings: Listing[]): Promise<void> {
  writeJson(STORAGE_KEY, listings)
}

/**
 * FETCH LISTINGS (mock for now)
 */
export async function fetchListings(): Promise<Listing[]> {
  const saved = readJson<Listing[]>(STORAGE_KEY)
  if (saved && saved.length > 0) return saved
  return mockListings
}

/**
 * GET SINGLE LISTING
 */
export async function getListingById(id: string): Promise<Listing | undefined> {
  const listings = await fetchListings()
  return listings.find((listing) => listing.id === id)
}

/**
 * CREATE LISTING
 */
export async function createListing(
  input: CreateListingInput,
): Promise<Listing> {

  const currentUser = auth.currentUser

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
      storageService.uploadListingImage(file, currentUser.uid, listingId),
    ),
  )

  const listing: Listing = {
    id: listingId,
    title: input.title.trim(),
    description: input.description.trim(),
    imageUrls,
    listingType: input.listingType,
    category: input.category.trim(),
    ownerId: currentUser.uid,
    ownerName: currentUser.email ?? 'User',
    createdAt,
    condition: input.condition.trim(),
    availability: input.availability,
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

/**
 * UPDATE LISTING
 */
export async function updateListing(
  id: string,
  input: UpdateListingInput,
): Promise<Listing> {

  const currentUser = auth.currentUser

  if (!currentUser) {
    throw new Error('You must be signed in to update a listing.')
  }

  const listings = await fetchListings()
  const existing = listings.find((l) => l.id === id)

  if (!existing) throw new Error('Listing not found.')
  if (existing.ownerId !== currentUser.uid) {
    throw new Error('You can only edit your own listings.')
  }

  const imageUrls =
    input.imageFiles && input.imageFiles.length > 0
      ? await Promise.all(
          input.imageFiles.map((file) =>
            storageService.uploadListingImage(file, currentUser.uid, id),
          ),
        )
      : existing.imageUrls

  const updated: Listing = {
    ...existing,
    title: input.title ?? existing.title,
    description: input.description ?? existing.description,
    category: input.category ?? existing.category,
    listingType: input.listingType ?? existing.listingType,
    condition: input.condition ?? existing.condition,
    availability: input.availability ?? existing.availability,
    imageUrls,
  }

  const next = listings.map((l) => (l.id === id ? updated : l))
  await saveListings(next)

  return updated
}

/**
 * DELETE LISTING
 */
export async function deleteListing(id: string): Promise<void> {

  const currentUser = auth.currentUser

  if (!currentUser) {
    throw new Error('You must be signed in to delete a listing.')
  }

  const listings = await fetchListings()
  const existing = listings.find((l) => l.id === id)

  if (!existing) throw new Error('Listing not found.')
  if (existing.ownerId !== currentUser.uid) {
    throw new Error('You can only delete your own listings.')
  }

  const next = listings.filter((l) => l.id !== id)
  await saveListings(next)
}