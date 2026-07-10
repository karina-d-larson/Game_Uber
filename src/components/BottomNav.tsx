import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../routes/paths'
import { buildLoginRedirect } from '../utils/authRedirect'
import { MaterialIcon } from './MaterialIcon'

type TabConfig = {
  id: string
  to: string
  label: string
  icon: string
  requiresAuth?: boolean
  /** When set, overrides default NavLink active matching */
  isActive?: (pathname: string) => boolean
}

const tabs: TabConfig[] = [
  {
    id: 'home',
    to: ROUTES.home,
    label: 'Home',
    icon: 'home',
    isActive: (pathname) => pathname === ROUTES.home,
  },
  {
    id: 'create',
    to: ROUTES.createListing,
    label: 'Create',
    icon: 'add_box',
    requiresAuth: true,
    isActive: (pathname) => pathname === ROUTES.createListing,
  },
  {
    id: 'inbox',
    to: ROUTES.inbox,
    label: 'Inbox',
    icon: 'mail',
    requiresAuth: true,
    isActive: (pathname) =>
      pathname === ROUTES.inbox || pathname.startsWith(`${ROUTES.inbox}/`),
  },
  {
    id: 'profile',
    to: ROUTES.profile,
    label: 'Profile',
    icon: 'person',
    requiresAuth: true,
    isActive: (pathname) =>
      pathname.startsWith('/profile') || pathname === ROUTES.settings,
  },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const { user } = useAuth()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 w-full rounded-t-xl border-t border-outline-variant bg-surface shadow-lg dark:border-outline dark:bg-surface"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-[var(--bottom-nav-height)] max-w-screen-xl items-stretch justify-around px-gutter-mobile pb-safe">
        {tabs.map((tab) => {
          const active = tab.isActive
            ? tab.isActive(pathname)
            : tab.id === 'home'
              ? pathname === ROUTES.home
              : pathname === tab.to

          const destination =
            !user && tab.requiresAuth
              ? buildLoginRedirect(tab.to)
              : { pathname: tab.to }

          return (
            <NavLink
              key={tab.id}
              to={destination}
              end={tab.id === 'home'}
              aria-current={active ? 'page' : undefined}
              className={[
                'flex min-h-11 min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-1 transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
                active
                  ? 'font-semibold text-secondary dark:text-secondary-fixed'
                  : 'text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container-highest',
              ].join(' ')}
            >
              <MaterialIcon name={tab.icon} filled={active} className="text-[22px]" />
              <span className="font-label-md text-[11px] leading-tight">{tab.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
