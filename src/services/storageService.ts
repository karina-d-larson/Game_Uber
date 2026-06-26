/**
 * FIREBASE — Storage (dual mode: DEV + Firebase)
 * ============================================
 * - DEV mode: returns base64/data URL (local testing)
 * - FIREBASE mode: uploads to Firebase Storage and returns download URL
 *
 * Do NOT remove DEV mode until Firestore integration is fully complete.
 */

import { readImageAsDataUrl } from '../utils/imageFile'

// Firebase imports (used only for real upload path)
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../lib/firebase'

/**
 * DEV MODE (current active fallback)
 * ----------------------------------
 * Keeps local mode working with no Firebase dependency.
 */
export async function uploadListingImage(
  file: File,
  userId: string,
  listingId?: string,
): Promise<string> {
  void userId
  void listingId

  return await readImageAsDataUrl(file)
}

/**
 * FIREBASE MODE (to be wired in listingService.firestore.ts)
 * -----------------------------------------------------------
 * Uploads image to Firebase Storage and returns HTTPS URL.
 */
export async function uploadListingImageFirebase(
  file: File,
  userId: string,
  listingId: string,
): Promise<string> {
  const safeFileName = `${Date.now()}-${file.name}`

  const storageRef = ref(
    storage,
    `listings/${userId}/${listingId}/${safeFileName}`,
  )

  // Upload file to Firebase Storage
  await uploadBytes(storageRef, file)

  // Get public download URL
  const downloadURL = await getDownloadURL(storageRef)

  return downloadURL
}