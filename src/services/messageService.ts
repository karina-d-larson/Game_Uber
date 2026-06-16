/**
 * MESSAGING DATA LAYER — swap implementation here for Firestore (Milestone 4)
 * =============================================================================
 * Docs: docs/FIREBASE_INTEGRATION.md — Messaging
 *
 * UI: MessagesContext / pages only — no Firestore in components.
 *
 * FIREBASE TODO:
 *   fetchConversations     → query conversations collection
 *   fetchMessages          → query messages by conversationId
 *   subscribeToMessages    → onSnapshot listener
 *   sendMessage            → addDoc + update conversation lastMessage
 *   createConversation     → addDoc + optional initial message
 */

import type {
  Conversation,
  CreateConversationInput,
  Message,
  SendMessageInput,
} from '../types/message'
import * as devMessages from './messageService.dev'

export async function fetchConversations(): Promise<Conversation[]> {
  return devMessages.devFetchConversations()
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  return devMessages.devFetchMessages(conversationId)
}

/**
 * FIREBASE TODO: onSnapshot listener — return unsubscribe function.
 * Dev fallback: one-time fetch (no realtime).
 */
export function subscribeToMessages(
  conversationId: string,
  onMessages: (messages: Message[]) => void,
): () => void {
  let cancelled = false

  void fetchMessages(conversationId).then((messages) => {
    if (!cancelled) onMessages(messages)
  })

  return () => {
    cancelled = true
  }
}

export async function sendMessage(input: SendMessageInput): Promise<Message> {
  if (!input.body.trim()) {
    throw new Error('Message cannot be empty.')
  }
  return devMessages.devSendMessage(input)
}

/** FIREBASE TODO: create conversation doc if none exists for listing+participants. */
export async function createConversation(
  input: CreateConversationInput,
): Promise<Conversation> {
  return devMessages.devCreateConversation(input)
}

/** FIREBASE TODO: map Firestore document → Conversation */
// export function mapDocToConversation(id: string, data: Record<string, unknown>): Conversation { ... }

/** FIREBASE TODO: map Firestore document → Message */
// export function mapDocToMessage(id: string, data: Record<string, unknown>): Message { ... }
