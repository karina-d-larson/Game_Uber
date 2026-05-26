import { Outlet } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'

/**
 * Mobile tab shell: scrollable page region + fixed bottom navigation.
 * Used for Home, Create Listing, Inbox, and Profile.
 */
export function AppShellLayout() {
  return (
    <div className="app-shell flex min-h-dvh flex-col bg-background text-on-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-md focus:top-safe focus:z-[60] focus:rounded-lg focus:bg-surface focus:px-md focus:py-sm focus:shadow-md"
      >
        Skip to main content
      </a>

      <div className="app-shell__content flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>

      <BottomNav />
    </div>
  )
}
