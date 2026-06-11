import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { ListingSkeleton } from '../components/ListingSkeleton'
import { EmptyState } from '../components/EmptyState'
import { ConversationList } from '../components/messaging/ConversationList'
import { useAuth } from '../context/AuthContext'
import { useMessages } from '../context/MessagesContext'

export function InboxPage() {
  const { user } = useAuth()
  const { conversations, loading, error, refreshConversations } = useMessages()

  const currentUserId = user?.id ?? 'guest-user'

  return (
    <Page header={<PageHeader variant="inbox" title="Inbox" />}>
      <section className="mb-xl">
        <div className="mb-md flex items-center justify-between">
          <h2 className="font-headline-md text-headline-md text-on-surface">Messages</h2>
          {conversations.some((c) => (c.unreadCount ?? 0) > 0) && (
            <span className="rounded-full bg-secondary-container px-sm py-xs font-label-md text-label-md text-on-secondary-container">
              {conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0)} unread
            </span>
          )}
        </div>

        {loading && conversations.length === 0 ? (
          <ListingSkeleton count={3} />
        ) : error ? (
          <div className="rounded-xl border border-error/30 bg-error/5 p-md">
            <p className="font-body-md text-error">{error}</p>
            <button
              type="button"
              onClick={() => void refreshConversations()}
              className="mt-sm min-h-11 rounded-lg bg-secondary px-md py-2 font-label-md text-label-md text-on-secondary"
            >
              Retry
            </button>
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="When someone requests your game or sends a message, conversations will appear here."
          />
        ) : (
          <ConversationList
            conversations={conversations}
            currentUserId={currentUserId}
          />
        )}
      </section>
    </Page>
  )
}
