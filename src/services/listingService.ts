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
import type { CreateListingInput, Listing } from '../types/listing'
import { readJson, writeJson } from '../utils/localStorage'

const STORAGE_KEY = 'boardlink_listings'

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

function formatPrice(
  arrangementType: CreateListingInput['arrangementType'],
  pricePerDay?: number,
): string {
  if (arrangementType === 'trade') return 'Trade Only'
  if (arrangementType === 'free') return 'Free'
  if (pricePerDay && pricePerDay > 0) return `$${pricePerDay}/day`
  return 'Contact for price'
}

/** TEMP: builds a listing locally until Firestore + auth provide owner fields */
function buildListing(input: CreateListingInput): Listing {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `listing-${Date.now()}`

  return {
    id,
    title: input.title.trim(),
    category: input.category,
    condition: input.condition,
    arrangementType: input.arrangementType,
    listingMode: input.listingMode,
    price: formatPrice(input.arrangementType, input.pricePerDay),
    pricePerDay: input.pricePerDay,
    description: input.description.trim(),
    owner: {
      name: 'You',
      username: '@boardgame_guru',
      rating: 4.8,
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDKHIZ20m5AdsPygH7mo9GAuD80aTL1xPNpdImx_PbFWb2frljMf0-fa9nge7jYqMfhFyaoBDh6ebxk3Gw4W7FyskHsCV8GEnP61EJoS7kCkTtOeZ5DoilGGfNxKrkO4uQYnWY68kDyGSEOszS1csnfhTtXjjNVAxzPydRi1ChhsLJL0i2_KYXFjiuG3wqA0yiAkjW2HFNlQk3HJ6pv_AobcvOdPxIVOlOEGe78QMDjrvw8r3MQ9XRbkv05WoJl0boYQlLJFe_Z-7g',
      verified: true,
    },
    location: input.location.trim(),
    rating: 4.8,
    image:
      input.image ??
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA5AskxegN_GNGS0yItNT7I96fiHqflGxAISzuplgl0WTCdbI2R1kP2o5_16-nwqWVrSuKxnJzsakKKNtrfcVHxdg5V9IyUFCPp3_vj5Z_URR340_Lr65hHaraH4P6Cd76UwaobBkv59dQBBwjW0f6xBVar0vDlLgdp4ZyxquW82Ybd2XDw9d6A3Es7VGDw0X3FzQbXRx1mfXkBM_clNQgotM0RFJvsTHEPXeQtgbSg9iO8gCdEhpRwupFqcvHV1jLzaUpZPRPmqXo',
    meetupPreferences: input.meetupPreferences,
    players: '2-4 Players',
    playTime: '60-90m',
  }
}

/**
 * FIREBASE TODO: replace body with getDocs(collection(db, 'listings'))
 * Keep return type Promise<Listing[]>. Dashboard will use this via ListingsContext.
 */
export async function fetchListings(): Promise<Listing[]> {
  const saved = readJson<Listing[]>(STORAGE_KEY)
  if (saved && saved.length > 0) return saved
  return mockListings
}

/** FIREBASE TODO: remove when using per-document writes in Firestore */
export async function saveListings(listings: Listing[]): Promise<void> {
  writeJson(STORAGE_KEY, listings)
}

/**
 * FIREBASE TODO: replace with getDoc(doc(db, 'listings', id)) + mapDocToListing
 */
export async function getListingById(id: string): Promise<Listing | undefined> {
  const listings = await fetchListings()
  return listings.find((listing) => listing.id === id)
}

/**
 * FIREBASE TODO:
 *   1. Upload image via storageService if file selected (not base64 in Firestore)
 *   2. addDoc with ownerId = auth current user
 *   3. Return mapDocToListing result
 *
 * TEMP: `input.image` may be a data URL from CreateListingPage for localStorage persistence.
 * Remove large base64 blobs from docs when Storage is live.
 */
export async function createListing(
  input: CreateListingInput,
): Promise<Listing> {
  const listings = await fetchListings()
  const listing = buildListing(input)
  const next = [listing, ...listings]
  await saveListings(next)
  return listing
}
