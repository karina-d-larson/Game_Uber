import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ListingsProvider } from './context/ListingsContext'
import { AppLayout } from './layouts/AppLayout'
import { CreateListingPage } from './pages/CreateListingPage'
import { DashboardPage } from './pages/DashboardPage'
import { InboxPage } from './pages/InboxPage'
import { ListingDetailPage } from './pages/ListingDetailPage'
import { ProfilePage } from './pages/ProfilePage'

export default function App() {
  return (
    <ListingsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="inbox" element={<InboxPage />} />
            <Route path="listings/new" element={<CreateListingPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="listings/:id" element={<ListingDetailPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ListingsProvider>
  )
}
