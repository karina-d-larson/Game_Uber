import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MaterialIcon } from '../MaterialIcon'
import { SearchBar } from '../SearchBar'
import { ROUTES } from '../../routes/paths'

export type PageHeaderVariant = 'feed' | 'profile' | 'create' | 'stack' | 'inbox'

type PageHeaderProps = {
  variant?: PageHeaderVariant
  title?: string
  /** Navigate back via history, or to a fixed path */
  back?: 'history' | { to: string; label?: string }
  searchValue?: string
  onSearchChange?: (value: string) => void
  actions?: ReactNode
}

/**
 * Shared sticky header — preserves GameShelf prototype styling.
 */
export function PageHeader({
  variant = 'feed',
  title,
  back,
  searchValue = '',
  onSearchChange,
  actions,
}: PageHeaderProps) {
  const navigate = useNavigate()

  function handleBack() {
    if (!back) return
    if (back === 'history') navigate(-1)
    else navigate(back.to)
  }

  if (variant === 'create') {
    return (
      <header className="sticky top-0 z-50 w-full bg-surface pt-safe shadow-sm dark:bg-surface">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-md py-sm">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() => (back ? handleBack() : navigate(-1))}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full transition-transform active:scale-95"
              aria-label="Close create listing"
            >
              <MaterialIcon
                name="close"
                className="text-primary dark:text-primary-fixed"
              />
            </button>
            <h1 className="truncate font-headline-md text-headline-md text-primary dark:text-primary-fixed">
              {title ?? 'Create Listing'}
            </h1>
          </div>
          <div className="font-display-lg text-display-lg text-secondary dark:text-secondary-fixed">
            GameShelf
          </div>
          <div className="w-10 shrink-0" aria-hidden="true" />
        </div>
      </header>
    )
  }

  if (variant === 'stack') {
    return (
      <header className="sticky top-0 z-50 w-full bg-surface pt-safe shadow-sm dark:bg-surface">
        <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between gap-sm px-md py-sm">
          <div className="flex min-w-0 items-center gap-xs">
            <button
              type="button"
              onClick={() => (back ? handleBack() : navigate(-1))}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full transition-transform hover:bg-surface-container-low active:scale-95"
              aria-label={back === 'history' ? 'Go back' : 'Back'}
            >
              <MaterialIcon name="arrow_back" className="text-primary" />
            </button>
            <span className="truncate font-display-lg text-display-lg text-secondary dark:text-secondary-fixed">
              {title ?? 'GameShelf'}
            </span>
          </div>
          {actions ?? (
            <div className="flex shrink-0 items-center gap-xs">
              <button
                type="button"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low"
                aria-label="Save to favorites (not implemented)"
              >
                <MaterialIcon name="favorite" />
              </button>
              <button
                type="button"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-low"
                aria-label="Share listing (not implemented)"
              >
                <MaterialIcon name="share" />
              </button>
            </div>
          )}
        </div>
      </header>
    )
  }

  if (variant === 'profile' || variant === 'inbox') {
    return (
      <header className="sticky top-0 z-50 w-full bg-surface pt-safe shadow-sm dark:bg-surface">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-md py-sm">
          <div className="flex items-center gap-md">
            {variant === 'profile' && (
              <button
                type="button"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full transition-transform hover:bg-surface-container-low active:scale-95"
                aria-label="Search (not implemented)"
              >
                <MaterialIcon name="search" className="text-primary" />
              </button>
            )}
          </div>
          <h1 className="font-display-lg text-display-lg text-secondary">
            {title ?? (variant === 'inbox' ? 'Inbox' : 'GameShelf')}
          </h1>
          <div className="flex items-center gap-md">
            {actions ?? <div className="w-11" aria-hidden="true" />}
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-surface pt-safe shadow-sm dark:bg-surface">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-md px-md py-sm">
        <Link
          to={ROUTES.home}
          className="shrink-0 font-display-lg text-display-lg text-secondary dark:text-secondary-fixed"
        >
          GameShelf
        </Link>
        <SearchBar value={searchValue} onChange={onSearchChange ?? (() => {})} />
      </div>
    </header>
  )
}
