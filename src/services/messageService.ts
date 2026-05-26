/**
 * MESSAGING DATA LAYER — implement for Firebase Milestone 4
 * ==========================================================
 * Docs: docs/FIREBASE_INTEGRATION.md — Messaging
 *
 * UI must NOT import Firestore. Pages use:
 *   - InboxPage → fetchConversations()
 *   - ChatPage → subscribeToMessages(conversationId, callback)
 *   - ListingDetailPage "Message Owner" → createConversation() then navigate to chat
 *
 * Realtime listeners attach HERE (onSnapshot), not in React components.
 *
 * FIREBASE TODO (teammate): implement all exports below using Firestore.
 */

import type {
  Conversation,
  CreateConversationInput,
  Message,
  SendMessageInput,
} from '../types/message'

/** FIREBASE TODO: query conversations where participantIds array-contains auth uid, orderBy lastMessageAt desc */
export async function fetchConversations(): Promise<Conversation[]> {
  void fetchConversations
  return []
}

/** FIREBASE TODO: getDoc or query messages subcollection / top-level messages collection */
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  void conversationId
  return []
}

/**
 * FIREBASE TODO: onSnapshot listener — return unsubscribe function.
 * ChatPage should call this in useEffect; map docs via mapDocToMessage().
 */
export function subscribeToMessages(
  conversationId: string,
  onMessages: (messages: Message[]) => void,
): () => void {
  void conversationId
  void onMessages
  return () => {}
}

/** FIREBASE TODO: addDoc message + update conversation lastMessage fields in a batch/write */
export async function sendMessage(input: SendMessageInput): Promise<Message> {
  void input
  throw new Error('Messaging not implemented. See messageService.ts FIREBASE TODO.')
}

/**
 * FIREBASE TODO: create conversation doc if none exists for listing+participants;
 * optionally send initialMessage in same transaction.
 */
export async function createConversation(
  input: CreateConversationInput,
): Promise<Conversation> {
  void input
  throw new Error('Messaging not implemented. See messageService.ts FIREBASE TODO.')
}

/** FIREBASE TODO: map Firestore document → Conversation */
// export function mapDocToConversation(id: string, data: DocumentData): Conversation { ... }

/** FIREBASE TODO: map Firestore document → Message */
// export function mapDocToMessage(id: string, data: DocumentData): Message { ... }
