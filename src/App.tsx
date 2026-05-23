import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthGate, GuestRoute, ProtectedRoute } from './components/AuthGate'
import { AuthProvider } from './context/AuthContext'
import { ListingsProvider } from './context/ListingsContext'
import { AppLayout } from './layouts/AppLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { CreateListingPage } from './pages/CreateListingPage'
import { DashboardPage } from './pages/DashboardPage'
import { InboxPage } from './pages/InboxPage'
import { ListingDetailPage } from './pages/ListingDetailPage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { SignupPage } from './pages/SignupPage'

/**
 * App routes — AuthProvider wraps the tree; protected routes require mock/Firebase session.
 *
 * FIREBASE TODO (teammate): authService + onAuthStateChanged — ProtectedRoute/GuestRoute stay as-is.
 * See: docs/FIREBASE_INTEGRATION.md — Authentication
 */
export default function App() {
  return (
    <AuthProvider>
      <ListingsProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthGate />}>
              <Route element={<GuestRoute />}>
                <Route element={<AuthLayout />}>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="signup" element={<SignupPage />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="inbox" element={<InboxPage />} />
                  <Route path="listings/new" element={<CreateListingPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                </Route>

                <Route path="listings/:id" element={<ListingDetailPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ListingsProvider>
    </AuthProvider>
  )
}
