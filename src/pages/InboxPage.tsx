import { Link } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { ROUTES } from '../routes/paths'

/**
 * INBOX STUB — Firebase messaging not implemented yet.
 *
 * FIREBASE TODO (teammate): Milestone 4 in docs/FIREBASE_INTEGRATION.md
 *   - messageService.ts + conversations collection
 *   - Realtime listener for thread list (onSnapshot)
 *   - Unread badge on BottomNav Inbox tab
 */
export function InboxPage() {
  return (
    <Page header={<PageHeader variant="inbox" title="Inbox" />}>
      <EmptyState
        title="No messages yet"
        description="When someone requests your game or sends a message, conversations will appear here."
        action={
          <Link
            to={ROUTES.chat('demo')}
            className="min-h-11 rounded-lg bg-secondary px-lg py-3 font-label-md text-label-md text-on-secondary"
          >
            Preview chat UI (demo)
          </Link>
        }
      />
    </Page>
  )
}
