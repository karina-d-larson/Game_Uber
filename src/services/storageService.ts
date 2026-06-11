/**
 * FIREBASE — Storage (teammate implements)
 * =========================================
 * Docs: docs/FIREBASE_INTEGRATION.md (Milestone 3)
 *
 * Suggested exports:
 *   - uploadListingImage(file: File, userId: string): Promise<string>
 *     → returns public download URL for listing.imageUrls[]
 *   - uploadListingGallery(files: File[], userId: string, listingId: string): Promise<string[]>
 *
 * Wire up in:
 *   - src/pages/CreateListingPage.tsx (image upload area ~line 120)
 *   - src/services/listingService.ts createListing() — pass URL into new listing doc
 *
 * Storage path pattern: listings/{userId}/{listingId}/{filename}
 */
import { readImageAsDataUrl } from '../utils/imageFile'

/**
 * Upload a single listing image and return a URL.
 *
 * DEV fallback:
 * - returns a data URL so the app behaves like "mock firebase" using only frontend code.
 *
 * FIREBASE TODO (teammate):
 * - Upload to Storage path `listings/{userId}/{listingId}/{filename}`
 * - Return `getDownloadURL(ref)`
 */
export async function uploadListingImage(
  file: File,
  userId: string,
  listingId?: string,
): Promise<string> {
  // `userId` + `listingId` are used for the real Storage path when Firebase is wired.
  void userId
  void listingId

  return await readImageAsDataUrl(file)
}

