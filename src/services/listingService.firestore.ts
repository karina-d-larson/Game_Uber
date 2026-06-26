import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
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

import {
  buildFirestoreCreatePayload,
  buildFirestoreUpdatePayload,
  toListingPurpose,
} from '../utils/listingMapping'

import { uploadListingImageFirebase } from './storageService'

/**
 * READ ALL LISTINGS
 */
export async function fetchListings(): Promise<Listing[]> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.listings))

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
  const snapshot = await getDoc(doc(db, COLLECTIONS.listings, id))

  if (!snapshot.exists()) return undefined

  return mapDocToListing(snapshot.id, snapshot.data())
}

/**
 * CREATE LISTING (WITH FIREBASE STORAGE FOR OFFERS)
 */
export async function createListing(
  input: CreateListingInput & { imageFiles?: File[] },
): Promise<Listing> {
  const currentUser = getCurrentUser()

  if (!currentUser) {
    throw new Error('You must be signed in to create a listing.')
  }

  const docRef = doc(collection(db, COLLECTIONS.listings))
  const listingId = docRef.id

  let imageUrls: string[] = []

  if (
    input.listingPurpose === 'offer' &&
    input.imageFiles &&
    input.imageFiles.length > 0
  ) {
    const file = input.imageFiles[0]

    const url = await uploadListingImageFirebase(
      file,
      currentUser.id,
      listingId,
    )

    imageUrls = [url]
  }

  const basePayload = buildFirestoreCreatePayload(input, {
    id: currentUser.id,
    displayName: currentUser.displayName,
  })

  const payload = {
    ...basePayload,
    imageUrls,
    ownerId: currentUser.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  await setDoc(docRef, payload)

  const snapshot = await getDoc(docRef)

  return mapDocToListing(docRef.id, snapshot.data()!)
}

/**
 * UPDATE LISTING (SAFE IMAGE HANDLING)
 */
export async function updateListing(
  id: string,
  input: UpdateListingInput & { imageFiles?: File[] },
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

  const existingPurpose = toListingPurpose(
    existing.listingPurpose,
    existing.listingType,
  )

  const imageFiles = input.imageFiles

  let imageUrls: string[] = existing.imageUrls ?? []

  if (existingPurpose === 'offer') {
    if (imageFiles && imageFiles.length > 0) {
      const file = imageFiles[0]

      const url = await uploadListingImageFirebase(
        file,
        currentUser.id,
        id,
      )

      imageUrls = [url]
    }
  } else {
    imageUrls = []
  }

  const { imageFiles: _ignored, ...inputWithoutFiles } = input

  await updateDoc(ref, {
    ...buildFirestoreUpdatePayload(inputWithoutFiles, existingPurpose),
    imageUrls,
    updatedAt: serverTimestamp(),
  })

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