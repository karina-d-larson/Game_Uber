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

import type {
  CreateListingInput,
  Listing,
  UpdateListingInput,
} from '../types/listing'

export class FirestoreListingsNotImplementedError extends Error {
  constructor(method: string) {
    super(
      `Firestore listings: \`${method}\` is not implemented yet. ` +
        'Add the implementation in src/services/listingService.firestore.ts.',
    )
    this.name = 'FirestoreListingsNotImplementedError'
  }
}

export async function fetchListings(): Promise<Listing[]> {
  throw new FirestoreListingsNotImplementedError('fetchListings')
}

export async function getListingById(_id: string): Promise<Listing | undefined> {
  throw new FirestoreListingsNotImplementedError('getListingById')
}

export async function createListing(_input: CreateListingInput): Promise<Listing> {
  throw new FirestoreListingsNotImplementedError('createListing')
}

export async function updateListing(
  _id: string,
  _input: UpdateListingInput,
): Promise<Listing> {
  throw new FirestoreListingsNotImplementedError('updateListing')
}

export async function deleteListing(_id: string): Promise<void> {
  throw new FirestoreListingsNotImplementedError('deleteListing')
}
