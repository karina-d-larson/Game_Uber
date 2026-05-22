/**
 * FIREBASE — Storage (teammate implements)
 * =========================================
 * Docs: docs/FIREBASE_INTEGRATION.md (Milestone 3)
 *
 * Suggested exports:
 *   - uploadListingImage(file: File, userId: string): Promise<string>
 *     → returns public download URL for listing.image
 *   - uploadListingGallery(files: File[], userId: string, listingId: string): Promise<string[]>
 *
 * Wire up in:
 *   - src/pages/CreateListingPage.tsx (image upload area ~line 120)
 *   - src/services/listingService.ts createListing() — pass URL into new listing doc
 *
 * Storage path pattern: listings/{userId}/{listingId}/{filename}
 */

export {}
