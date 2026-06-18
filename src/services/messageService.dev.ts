/**
 * LOCAL DEV BACKEND — localStorage + seed data for messaging.
 * FIREBASE TODO: delete when messageService uses Firestore only.
 */
import {
  seedConversations,
  seedMessagesByConversation,
} from '../data/mockMessages.seed'
import type { Conversation, Message, SendMessageInput } from '../types/message'
import {
  CURRENT_USER_PLACEHOLDER,
  resolveParticipantIds,
} from '../utils/conversationDisplay'
import { readJson, writeJson } from '../utils/localStorage'
import { getCurrentUser } from './authService'

export const DEV_CONVERSATIONS_KEY = 'gameshelf_conversations'
export const DEV_MESSAGES_KEY = 'gameshelf_messages'

type MessageStore = Record<string, Message[]>

function currentUserId(): string {
  return getCurrentUser()?.id ?? 'guest-user'
}

function resolveConversation(conversation: Conversation, userId: string): Conversation {
  const participantIds = resolveParticipantIds(conversation.participantIds, userId)
  const participantNames = conversation.participantNames.map((name, index) =>
    conversation.participantIds[index] === CURRENT_USER_PLACEHOLDER ? 'You' : name,
  )

  return {
    ...conversation,
    participantIds,
    participantNames,
  }
}

function resolveMessage(message: Message, userId: string): Message {
  const senderId =
    message.senderId === CURRENT_USER_PLACEHOLDER ? userId : message.senderId
  return { ...message, senderId }
}

function seedIfEmpty(): { conversations: Conversation[]; messages: MessageStore } {
  const userId = currentUserId()
  const savedConversations = readJson<Conversation[]>(DEV_CONVERSATIONS_KEY)
  const savedMessages = readJson<MessageStore>(DEV_MESSAGES_KEY)

  if (savedConversations?.length && savedMessages) {
    return {
      conversations: savedConversations.map((c) => resolveConversation(c, userId)),
      messages: Object.fromEntries(
        Object.entries(savedMessages).map(([id, msgs]) => [
          id,
          msgs.map((m) => resolveMessage(m, userId)),
        ]),
      ),
    }
  }

  const conversations = seedConversations.map((c) => resolveConversation(c, userId))
  const messages = Object.fromEntries(
    Object.entries(seedMessagesByConversation).map(([id, msgs]) => [
      id,
      msgs.map((m) => resolveMessage(m, userId)),
    ]),
  )

  writeJson(DEV_CONVERSATIONS_KEY, conversations)
  writeJson(DEV_MESSAGES_KEY, messages)
  return { conversations, messages }
}

function persist(
  conversations: Conversation[],
  messages: MessageStore,
): void {
  writeJson(DEV_CONVERSATIONS_KEY, conversations)
  writeJson(DEV_MESSAGES_KEY, messages)
}

export async function devCreateConversation(
  input: CreateConversationInput,
): Promise<Conversation> {
  const user = getCurrentUser()

  if (!user) {
    throw new Error('You must be signed in to start a conversation.')
  }

  const { conversations, messages } = seedIfEmpty()

  const now = Date.now()

  const conversation: Conversation = {
    id: `conv-${now}-${Math.random().toString(36).slice(2, 8)}`,
    participantIds: input.participantIds,
    participantNames: input.participantNames,
    lastMessageText: '',
    lastMessageAt: now,
    unreadCount: 0,
  }

  const nextConversations = [conversation, ...conversations]

  persist(nextConversations, {
    ...messages,
    [conversation.id]: [],
  })

  return conversation
}


export async function devFetchConversations(): Promise<Conversation[]> {
  const { conversations } = seedIfEmpty()
  return [...conversations].sort((a, b) => b.lastMessageAt - a.lastMessageAt)
}

export async function devFetchMessages(conversationId: string): Promise<Message[]> {
  const { messages } = seedIfEmpty()
  return messages[conversationId] ?? []
}

export async function devSendMessage(input: SendMessageInput): Promise<Message> {
  const user = getCurrentUser()
  if (!user) {
    throw new Error('You must be signed in to send a message.')
  }

  const { conversations, messages } = seedIfEmpty()
  const conversation = conversations.find((c) => c.id === input.conversationId)
  if (!conversation) {
    throw new Error('Conversation not found.')
  }

  const now = Date.now()
  const message: Message = {
    id: `msg-${now}-${Math.random().toString(36).slice(2, 8)}`,
    conversationId: input.conversationId,
    senderId: user.id,
    senderName: user.displayName,
    body: input.body.trim(),
    createdAt: now,
    read: true,
  }

  const thread = [...(messages[input.conversationId] ?? []), message]
  const nextMessages: MessageStore = { ...messages, [input.conversationId]: thread }

  const nextConversations = conversations.map((c) =>
    c.id === input.conversationId
      ? {
          ...c,
          lastMessageText: message.body,
          lastMessageAt: now,
          unreadCount: 0,
        }
      : c,
  )

  persist(nextConversations, nextMessages)
  return message
}

/** Clear stale dev messaging data after Firestore migration. */
export function devClearMessagingStorage(): void {
  localStorage.removeItem(DEV_CONVERSATIONS_KEY)
  localStorage.removeItem(DEV_MESSAGES_KEY)
}
