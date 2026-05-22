import { Navbar } from '../components/Navbar'

/** Placeholder until messaging is built (Firebase later). */
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
