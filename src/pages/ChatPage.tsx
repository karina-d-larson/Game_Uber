import { Link, useParams } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { ROUTES } from '../routes/paths'

/**
 * Chat thread stub — realtime messaging not implemented.
 *
 * FIREBASE TODO (teammate):
 * - messageService.subscribeToMessages(conversationId, callback)
 * - onSnapshot for messages subcollection
 * - typing indicators / read receipts (future)
 * - push notifications hook point (do not implement yet)
 * - Keep all Firestore listener logic in messageService, not this page component.
 */
export function ChatPage() {
  const { conversationId } = useParams()

  return (
    <Page
      header={
        <PageHeader
          variant="stack"
          title="Chat"
          back={{ to: ROUTES.inbox, label: 'Back to inbox' }}
        />
      }
      footerSpace="none"
      className="flex flex-col"
    >
      <p className="font-body-md text-body-md text-on-surface-variant">
        Conversation: <span className="font-mono text-on-surface">{conversationId}</span>
      </p>
      <p className="mt-md font-body-md text-body-md text-on-surface-variant">
        Messaging will connect here in a future release. See{' '}
        <code className="text-secondary">docs/FIREBASE_INTEGRATION.md</code> Milestone 4.
      </p>
      <Link
        to={ROUTES.inbox}
        className="mt-lg inline-flex min-h-11 items-center text-secondary hover:underline"
      >
        Back to inbox
      </Link>
    </Page>
  )
}
