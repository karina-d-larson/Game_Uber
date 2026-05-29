import { AuthProvider } from './context/AuthContext'
import { ListingsProvider } from './context/ListingsContext'
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
        <AppRouter />
      </ListingsProvider>
    </AuthProvider>
  )
}
