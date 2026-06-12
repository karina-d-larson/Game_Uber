/**
 * FIRESTORE LISTINGS BACKEND — implement here when VITE_LISTINGS_BACKEND=firestore
 * ================================================================================
 *
 * This module is the ONLY place for Firestore listing reads/writes.
 * Do NOT import listingService.dev.ts from here.
 *
 * Wire-up checklist:
 * 1. Implement each exported function below
 * 2. Use mapDocToListing from listingService.ts for reads
 * 3. Use COLLECTIONS.listings from config/firebaseCollections.ts
 * 4. Set VITE_LISTINGS_BACKEND=firestore in .env
 * 5. Delete listingService.dev.ts after migration is verified
 */

/**
 * FIRESTORE LISTINGS BACKEND — implement here when VITE_LISTINGS_BACKEND=firestore
 * ================================================================================
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'

import { COLLECTIONS } from '../config/firebaseCollections'
import { db } from '../lib/firebase'
import type {
  CreateListingInput,
  Listing,
  UpdateListingInput,
} from '../types/listing'
import { mapDocToListing } from './listingService'
import { getCurrentUser } from './authService'

export class FirestoreListingsNotImplementedError extends Error {
  constructor(method: string) {
    super(
      `Firestore listings: \`${method}\` is not implemented yet. ` +
        'Add the implementation in src/services/listingService.firestore.ts.',
    )
    this.name = 'FirestoreListingsNotImplementedError'
  }
}

/**
 * READ ALL LISTINGS
 */
export async function fetchListings(): Promise<Listing[]> {
  const snapshot = await getDocs(
    collection(db, COLLECTIONS.listings),
  )

  return snapshot.docs.map((docSnap) =>
    mapDocToListing(docSnap.id, docSnap.data()),
  )
}

/**
 * READ SINGLE LISTING
 */
export async function getListingById(
  id: string,
): Promise<Listing | undefined> {
  const snapshot = await getDoc(
    doc(db, COLLECTIONS.listings, id),
  )

  if (!snapshot.exists()) return undefined

  return mapDocToListing(snapshot.id, snapshot.data())
}

/**
 * CREATE LISTING (NO STORAGE VERSION)
 */
export async function createListing(
  input: CreateListingInput,
): Promise<Listing> {
  const currentUser = getCurrentUser()

  if (!currentUser) {
    throw new Error('You must be signed in to create a listing.')
  }

  const docRef = await addDoc(
    collection(db, COLLECTIONS.listings),
    {
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category.trim(),

      listingType: input.listingType,
      condition: input.condition,
      availability: input.availability,

      ownerId: currentUser.id,
      ownerName: currentUser.displayName,

      // 🚫 no Storage for now
      imageUrls: [],

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),

      arrangementType: input.arrangementType ?? null,
      pricePerDay: input.pricePerDay ?? null,
      location: input.location?.trim() ?? null,
      meetupPreferences: input.meetupPreferences?.trim() ?? null,
    },
  )

  const snapshot = await getDoc(docRef)

  return mapDocToListing(docRef.id, snapshot.data()!)
}

/**
 * UPDATE LISTING
 */
export async function updateListing(
  id: string,
  input: UpdateListingInput,
): Promise<Listing> {
  const currentUser = getCurrentUser()

  if (!currentUser) {
    throw new Error('You must be signed in to update a listing.')
  }

  const ref = doc(db, COLLECTIONS.listings, id)
  const snapshot = await getDoc(ref)

  if (!snapshot.exists()) {
    throw new Error('Listing not found.')
  }

  const existing = snapshot.data()

  if (existing.ownerId !== currentUser.id) {
    throw new Error('You can only edit your own listings.')
  }

  const { imageFiles, ...safeInput } = input

  await updateDoc(ref, {
    ...safeInput,
    updatedAt: serverTimestamp(),
  })

  // 🔥 THIS is what you're missing:
  const updatedSnap = await getDoc(ref)

  return mapDocToListing(ref.id, updatedSnap.data()!)
}

/**
 * DELETE LISTING
 */
export async function deleteListing(id: string): Promise<void> {
  const currentUser = getCurrentUser()

  if (!currentUser) {
    throw new Error('You must be signed in to delete a listing.')
  }

  const ref = doc(db, COLLECTIONS.listings, id)
  const snapshot = await getDoc(ref)

  if (!snapshot.exists()) {
    throw new Error('Listing not found.')
  }

  const existing = snapshot.data()

  if (existing.ownerId !== currentUser.id) {
    throw new Error('You can only delete your own listings.')
  }

  await deleteDoc(ref)
}