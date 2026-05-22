import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { CommunityPage } from './pages/CommunityPage'
import { DashboardPage } from './pages/DashboardPage'
import { GameDetailPage } from './pages/GameDetailPage'
import { InboxPage } from './pages/InboxPage'
import { NewPostPage } from './pages/NewPostPage'
import { ProfilePage } from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="listings/new" element={<NewPostPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="community" element={<CommunityPage />} />
        </Route>

        <Route path="games/:id" element={<GameDetailPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
