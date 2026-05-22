import { NavLink } from 'react-router-dom'
import { MaterialIcon } from './MaterialIcon'

export type BottomNavTab = 'dashboard' | 'inbox' | 'new-post' | 'profile'

const tabs: {
  id: BottomNavTab
  to: string
  label: string
  icon: string
  end?: boolean
}[] = [
  { id: 'dashboard', to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { id: 'inbox', to: '/inbox', label: 'Inbox', icon: 'mail' },
  { id: 'new-post', to: '/listings/new', label: 'Add Post', icon: 'add_box' },
  { id: 'profile', to: '/profile', label: 'Profile', icon: 'person' },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 z-50 w-full rounded-t-xl border-t border-outline-variant bg-surface shadow-lg dark:border-outline dark:bg-surface">
      <div className="flex h-16 w-full items-center justify-around px-gutter-mobile pb-safe">
        {tabs.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center rounded-lg p-2 transition-all hover:bg-surface-container-high dark:hover:bg-surface-container-highest',
                isActive
                  ? 'font-semibold text-secondary dark:text-secondary-fixed'
                  : 'text-on-surface-variant dark:text-on-surface-variant',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <MaterialIcon name={tab.icon} filled={isActive} />
                <span className="font-label-md text-label-md">{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
