import type { ReactNode } from 'react'

type PageProps = {
  children: ReactNode
  /** Sticky header slot (PageHeader, Navbar, etc.) */
  header?: ReactNode
  /** Extra classes on the main landmark */
  className?: string
  /** Tighter top padding when header is present */
  withHeader?: boolean
  /** Use wide bottom padding for fixed footers (detail CTAs) */
  footerSpace?: 'nav' | 'large' | 'none'
}

const footerSpaceClass = {
  nav: '',
  large: 'pb-32',
  none: 'pb-md',
} as const

/**
 * Standard page container — consistent gutters, max width, and scroll padding.
 * Pair with AppShellLayout (tab routes) or StackShellLayout (stack routes).
 */
export function Page({
  children,
  header,
  className = '',
  withHeader = Boolean(header),
  footerSpace = 'nav',
}: PageProps) {
  return (
    <>
      {header}
      <main
        id="main-content"
        className={[
          'mx-auto w-full max-w-screen-xl flex-1 px-gutter-mobile md:px-gutter-desktop',
          withHeader ? 'py-md' : 'py-xl',
          footerSpaceClass[footerSpace],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </main>
    </>
  )
}
