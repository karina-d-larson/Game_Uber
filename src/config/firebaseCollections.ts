/**
 * Firestore collection names — single place to rename if needed.
 * See docs/FIREBASE_INTEGRATION.md for field schemas.
 */
export const COLLECTIONS = {
  listings: 'listings',
  users: 'users',
  /** Planned for Inbox / messaging milestone */
  conversations: 'conversations',
  messages: 'messages',
} as const
