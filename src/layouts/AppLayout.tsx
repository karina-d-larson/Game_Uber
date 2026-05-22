import { Outlet } from 'react-router-dom'
import { BottomNav } from '../components/BottomNav'

/** Main app shell: page content + shared bottom navigation. */
export function AppLayout() {
  return (
    <div className="min-h-dvh bg-background text-on-background">
      <Outlet />
      <BottomNav />
    </div>
  )
}
