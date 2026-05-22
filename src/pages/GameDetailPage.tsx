import { Link, useParams } from 'react-router-dom'
import { MaterialIcon } from '../components/MaterialIcon'

export function GameDetailPage() {
  const { id } = useParams()

  return (
    <div className="min-h-dvh bg-background text-on-background">
      <header className="sticky top-0 z-50 w-full bg-surface shadow-sm dark:bg-surface">
        <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-md py-sm">
          <div className="flex items-center gap-xs">
            <Link
              to="/"
              className="rounded-full p-2 transition-transform hover:bg-surface-container-low active:scale-95"
            >
              <MaterialIcon name="arrow_back" className="text-primary" />
            </Link>
            <span className="font-display-lg text-display-lg text-secondary dark:text-secondary-fixed">
              BoardLink
            </span>
          </div>
          <div className="flex items-center gap-md">
            <button
              type="button"
              className="cursor-pointer rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
            >
              <MaterialIcon name="favorite" />
            </button>
            <button
              type="button"
              className="cursor-pointer rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
            >
              <MaterialIcon name="share" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-gutter-mobile pb-32 md:px-gutter-desktop">
        <p className="mt-md font-headline-md text-headline-md capitalize">
          Game: {id ?? 'unknown'}
        </p>
        <p className="mt-md text-body-md text-on-surface-variant">
          Migrate content from <code className="text-secondary">html/game_detail.html</code>.
          This route uses no bottom nav (matches prototype detail view).
        </p>
      </main>
    </div>
  )
}
