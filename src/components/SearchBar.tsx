import { MaterialIcon } from './MaterialIcon'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search games...',
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-base">
      <div className="relative hidden items-center md:flex">
        <MaterialIcon
          name="search"
          className="absolute left-3 text-on-surface-variant"
        />
        <input
          className="w-64 rounded-full border-none bg-surface-container-low py-2.5 pr-4 pl-10 text-sm leading-normal text-on-surface focus:ring-2 focus:ring-secondary"
          placeholder={placeholder}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <button
        type="button"
        className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low active:scale-95 dark:text-primary-fixed md:hidden"
        aria-label="Search"
      >
        <MaterialIcon name="search" />
      </button>
      <button
        type="button"
        className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container-low active:scale-95 dark:text-primary-fixed"
        aria-label="Filters"
      >
        <MaterialIcon name="tune" />
      </button>
    </div>
  )
}
