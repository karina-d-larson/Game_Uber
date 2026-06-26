import { Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RouteErrorFallback } from '../components/errors/RouteErrorFallback'
import { PageLoadingFallback } from '../components/navigation/PageLoadingFallback'
import { AppShellLayout } from '../layouts/AppShellLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { StackShellLayout } from '../layouts/StackShellLayout'
import { ChatPage } from '../pages/ChatPage'
import { CreateListingPage } from '../pages/CreateListingPage'
import { DashboardPage } from '../pages/DashboardPage'
import { EditListingPage } from '../pages/EditListingPage'
import { InboxPage } from '../pages/InboxPage'
import { ListingDetailPage } from '../pages/ListingDetailPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { EditProfilePage } from '../pages/EditProfilePage'
import { FollowingPage } from '../pages/FollowingPage'
import { SettingsPage } from '../pages/SettingsPage'
import { ProfilePage } from '../pages/ProfilePage'
import { SignupPage } from '../pages/SignupPage'
import { AuthGate, GuestRoute, ProtectedRoute } from './guards'

/**
 * Application routing — organized by access level and shell type.
 *
 * Public: login, signup (AuthLayout)
 * Protected + tabs: home, inbox, create, profile (AppShellLayout)
 * Protected + stack: listing detail, edit, chat (StackShellLayout)
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route element={<AuthGate />} errorElement={<RouteErrorFallback />}>
            {/* Guest auth */}
            <Route element={<GuestRoute />}>
              <Route element={<AuthLayout />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />
              </Route>
            </Route>

            {/* Authenticated */}
            <Route element={<ProtectedRoute />} errorElement={<RouteErrorFallback />}>
              {/* Tab shell — bottom navigation */}
              <Route element={<AppShellLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="inbox" element={<InboxPage />} />
                <Route path="listings/new" element={<CreateListingPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Stack shell — no bottom tabs */}
              <Route element={<StackShellLayout />}>
                <Route path="listings/:id" element={<ListingDetailPage />} />
                <Route path="listings/:id/edit" element={<EditListingPage />} />
                <Route path="inbox/:conversationId" element={<ChatPage />} />
                <Route path="profile/edit" element={<EditProfilePage />} />
                <Route path="profile/following" element={<FollowingPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
