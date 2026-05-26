/**
 * Messaging types — prepared for Firestore Milestone 4.
 *
 * Mapping: src/services/messageService.ts (create when implementing messaging).
 * UI must NOT import Firestore; use messageService + optional MessagesContext later.
 *
 * See: docs/FIREBASE_INTEGRATION.md — Messaging
 */

/** Thread between two users, often tied to a listing request. */
export type Conversation = {
  id: string
  /** Participant Firebase Auth uids */
  participantIds: string[]
  /** Denormalized for inbox list UI */
  participantNames: string[]
  listingId?: string
  listingTitle?: string
  lastMessageText: string
  lastMessageAt: number
  /** Unread count for current user — computed or stored per participant */
  unreadCount?: number
}

export type Message = {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  body: string
  createdAt: number
  /** FIREBASE TODO: server timestamp + readAt per recipient when adding read receipts */
  read?: boolean
}

export type SendMessageInput = {
  conversationId: string
  body: string
}

export type CreateConversationInput = {
  listingId: string
  recipientId: string
  initialMessage?: string
}
