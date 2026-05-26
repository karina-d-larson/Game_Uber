import { Link } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../routes/paths'

export function NotFoundPage() {
  const { user } = useAuth()

  return (
    <Page
      header={<PageHeader variant="stack" title="Not found" back={{ to: ROUTES.home }} />}
      footerSpace="none"
    >
      <div className="py-xl text-center">
        <p className="font-headline-md text-headline-md text-primary">Page not found</p>
        <p className="mt-sm font-body-md text-body-md text-on-surface-variant">
          This link may be broken or the page was removed.
        </p>
        <Link
          to={user ? ROUTES.home : ROUTES.login}
          className="mt-lg inline-flex min-h-11 items-center justify-center rounded-lg bg-secondary px-lg py-3 font-label-md text-label-md text-on-secondary"
        >
          {user ? 'Back to home' : 'Sign in'}
        </Link>
      </div>
    </Page>
  )
}
