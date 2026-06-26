/** Accepted image MIME types for listing photos (frontend-only preview). */
export const LISTING_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

/**
 * Read a user-selected file as a data URL (base64) for local preview + localStorage.
 *
 * FIREBASE TODO: replace with storageService.uploadListingImage(file) → download URL.
 * See docs/FIREBASE_INTEGRATION.md — Milestone 3
 */
export function readImageAsDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('Please choose a JPEG, PNG, or WebP image.'))
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return Promise.reject(new Error('Image must be 2 MB or smaller.'))
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Could not read image file.'))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image file.'))
    reader.readAsDataURL(file)
  })
}
