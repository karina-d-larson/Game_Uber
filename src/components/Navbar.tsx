import { Link, useNavigate } from 'react-router-dom'
import { MaterialIcon } from './MaterialIcon'
import { SearchBar } from './SearchBar'

type NavbarVariant = 'feed' | 'profile' | 'create' | 'detail'

type NavbarProps = {
  variant?: NavbarVariant
  searchValue?: string
  onSearchChange?: (value: string) => void
}

export function Navbar({
  variant = 'feed',
  searchValue = '',
  onSearchChange,
}: NavbarProps) {
  const navigate = useNavigate()

  if (variant === 'create') {
    return (
      <header className="sticky top-0 z-50 w-full bg-surface shadow-sm dark:bg-surface">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-md py-sm">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="active:scale-95 transition-transform"
            >
              <MaterialIcon
                name="close"
                className="text-primary dark:text-primary-fixed"
              />
            </button>
            <h1 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed">
              Create Listing
            </h1>
          </div>
          <div className="font-display-lg text-display-lg text-secondary dark:text-secondary-fixed">
            BoardLink
          </div>
          <div className="w-10" aria-hidden="true" />
        </div>
      </header>
    )
  }

  if (variant === 'detail') {
    return (
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
    )
  }

  if (variant === 'profile') {
    return (
      <header className="sticky top-0 z-50 w-full bg-surface shadow-sm dark:bg-surface">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-md py-sm">
          <div className="flex items-center gap-md">
            <button
              type="button"
              className="rounded-full p-2 transition-transform hover:bg-surface-container-low active:scale-95"
            >
              <MaterialIcon name="search" className="text-primary" />
            </button>
          </div>
          <h1 className="font-display-lg text-display-lg text-secondary">BoardLink</h1>
          <div className="flex items-center gap-md">
            <button
              type="button"
              className="rounded-full p-2 transition-transform hover:bg-surface-container-low active:scale-95"
            >
              <MaterialIcon name="tune" className="text-primary" />
            </button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-surface shadow-sm dark:bg-surface">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-md py-sm">
        <span className="font-display-lg text-display-lg text-secondary dark:text-secondary-fixed">
          BoardLink
        </span>
        <SearchBar value={searchValue} onChange={onSearchChange ?? (() => {})} />
      </div>
    </header>
  )
}
