/**
 * Shared messaging state — orchestrates messageService only.
 *
 * FIREBASE TODO: optional onSnapshot on conversations for live inbox updates.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as messageService from '../services/messageService'
import type { Conversation, Message, SendMessageInput } from '../types/message'
import { useAuth } from './AuthContext'

type MessagesContextValue = {
  conversations: Conversation[]
  loading: boolean
  error: string | null
  refreshConversations: () => Promise<void>
  findConversationById: (id: string) => Conversation | undefined
  getMessages: (conversationId: string) => Message[]
  loadMessages: (conversationId: string) => Promise<void>
  sendMessage: (input: SendMessageInput) => Promise<Message>
}

const MessagesContext = createContext<MessagesContextValue | null>(null)

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<string, Message[]>
  >({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshConversations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await messageService.fetchConversations()
      setConversations(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load conversations.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    void refreshConversations()
  }, [authLoading, refreshConversations])

  const findConversationById = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations],
  )

  const getMessages = useCallback(
    (conversationId: string) => messagesByConversation[conversationId] ?? [],
    [messagesByConversation],
  )

  const loadMessages = useCallback(async (conversationId: string) => {
    const data = await messageService.fetchMessages(conversationId)
    setMessagesByConversation((current) => ({
      ...current,
      [conversationId]: data,
    }))
  }, [])

  const sendMessage = useCallback(
    async (input: SendMessageInput) => {
      const created = await messageService.sendMessage(input)
      setMessagesByConversation((current) => ({
        ...current,
        [input.conversationId]: [
          ...(current[input.conversationId] ?? []),
          created,
        ],
      }))
      setConversations((current) =>
        [...current]
          .map((c) =>
            c.id === input.conversationId
              ? {
                  ...c,
                  lastMessageText: created.body,
                  lastMessageAt: created.createdAt,
                  unreadCount: 0,
                }
              : c,
          )
          .sort((a, b) => b.lastMessageAt - a.lastMessageAt),
      )
      return created
    },
    [],
  )

  const value = useMemo(
    () => ({
      conversations,
      loading,
      error,
      refreshConversations,
      findConversationById,
      getMessages,
      loadMessages,
      sendMessage,
    }),
    [
      conversations,
      loading,
      error,
      refreshConversations,
      findConversationById,
      getMessages,
      loadMessages,
      sendMessage,
    ],
  )

  return (
    <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessagesContext)
  if (!context) {
    throw new Error('useMessages must be used within MessagesProvider')
  }
  return context
}
