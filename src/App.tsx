import { AuthProvider } from './context/AuthContext'
import { ListingsProvider } from './context/ListingsContext'
import { MessagesProvider } from './context/MessagesContext'
import { AppRouter } from './routes/AppRouter'
import './lib/firebase'

/**
 * App root — providers + router.
 *
 * Routing architecture: docs/APP_ARCHITECTURE.md
 * Firebase: docs/FIREBASE_INTEGRATION.md
 */
export default function App() {
  return (
    <AuthProvider>
      <ListingsProvider>
        <MessagesProvider>
          <AppRouter />
        </MessagesProvider>
      </ListingsProvider>
    </AuthProvider>
  )
}
