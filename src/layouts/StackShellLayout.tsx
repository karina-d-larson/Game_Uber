import { Outlet } from 'react-router-dom'

/**
 * Stack shell for flows without bottom tabs (listing detail, edit, chat).
 * Full-height scroll; pages supply their own headers.
 */
export function StackShellLayout() {
  return (
    <div className="app-shell app-shell--stack flex min-h-dvh flex-col bg-background text-on-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-md focus:top-safe focus:z-[60] focus:rounded-lg focus:bg-surface focus:px-md focus:py-sm focus:shadow-md"
      >
        Skip to main content
      </a>

      <div className="app-shell__content flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
        <Outlet />
      </div>
    </div>
  )
}
