/**
 * @deprecated Prefer `PageHeader` from `./shell/PageHeader`.
 * Thin compatibility wrapper — preserves existing import paths.
 */
import { PageHeader, type PageHeaderVariant } from './shell/PageHeader'

type NavbarVariant = 'feed' | 'profile' | 'create' | 'detail'

type NavbarProps = {
  variant?: NavbarVariant
  searchValue?: string
  onSearchChange?: (value: string) => void
}

const variantMap: Record<NavbarVariant, PageHeaderVariant> = {
  feed: 'feed',
  profile: 'profile',
  create: 'create',
  detail: 'stack',
}

export function Navbar({ variant = 'feed', searchValue, onSearchChange }: NavbarProps) {
  return (
    <PageHeader
      variant={variantMap[variant]}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      back={variant === 'detail' ? 'history' : undefined}
    />
  )
}
