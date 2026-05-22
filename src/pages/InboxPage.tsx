import { Navbar } from '../components/Navbar'

/**
 * INBOX STUB — Firebase messaging not implemented yet.
 *
 * FIREBASE TODO (teammate): Milestone 4 in docs/FIREBASE_INTEGRATION.md
 *   - Create messageService.ts
 *   - Firestore collections: conversations / messages
 *   - Migrate UI from html/inbox.html (keep Tailwind classes)
 */
export function InboxPage() {
  return (
    <>
      <Navbar variant="profile" />
      <main className="mx-auto max-w-screen-xl px-gutter-mobile py-xl pb-24 md:px-gutter-desktop">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Inbox &amp; Requests
        </h1>
        <p className="mt-md text-body-md text-on-surface-variant">
          Messaging will connect here in a future release.
        </p>
      </main>
    </>
  )
}
