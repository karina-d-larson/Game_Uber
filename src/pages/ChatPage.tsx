import { Link, useLocation, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { ChatWindow } from '../components/messaging/ChatWindow'
import { useAuth } from '../context/AuthContext'
import { useMessages } from '../context/MessagesContext'
import { ROUTES } from '../routes/paths'
import type { Conversation } from '../types/message'
import { getOtherParticipant } from '../utils/conversationDisplay'

type ChatLocationState = {
  conversation?: Conversation
}

export function ChatPage() {
  const { conversationId } = useParams()
  const location = useLocation()
  const state = location.state as ChatLocationState | null
  const { user } = useAuth()
  const {
    findConversationById,
    getMessages,
    loadMessages,
    sendMessage,
  } = useMessages()

  const currentUserId = user?.id ?? 'guest-user'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const conversation =
    (conversationId ? findConversationById(conversationId) : undefined) ??
    state?.conversation ??
    null

  const messages = conversationId ? getMessages(conversationId) : []

  useEffect(() => {
    if (!conversationId) return
    const id = conversationId
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        await loadMessages(id)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load messages.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [conversationId, loadMessages])

  if (!conversationId) {
    return (
      <Page header={<PageHeader variant="stack" title="Chat" back={{ to: ROUTES.inbox, label: 'Back' }} />}>
        <p className="text-body-md text-on-surface-variant">Conversation not found.</p>
      </Page>
    )
  }

  if (!conversation) {
    return (
      <Page header={<PageHeader variant="stack" title="Chat" back={{ to: ROUTES.inbox, label: 'Back' }} />}>
        <p className="font-headline-md text-headline-md">Conversation not found</p>
        <Link to={ROUTES.inbox} className="mt-md inline-block text-secondary hover:underline">
          Back to inbox
        </Link>
      </Page>
    )
  }

  const other = getOtherParticipant(conversation, currentUserId)

  return (
    <Page
      header={
        <PageHeader
          variant="stack"
          title={other?.name ?? 'Chat'}
          back={{ to: ROUTES.inbox, label: 'Back to inbox' }}
        />
      }
      footerSpace="none"
      className="flex min-h-0 flex-1 flex-col !py-0"
    >
      {error && (
        <p className="border-b border-error/30 bg-error/5 px-md py-sm text-body-md text-error" role="alert">
          {error}
        </p>
      )}

      <ChatWindow
        messages={messages}
        currentUserId={currentUserId}
        loading={loading}
        onSend={async (body) => {
          await sendMessage({ conversationId, body })
        }}
      />
    </Page>
  )
}
