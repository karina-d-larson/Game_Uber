/**
 * Shared listing state for the React app.
 *
 * FIREBASE (teammate):
 *   - This file should keep calling src/services/listingService.ts only.
 *   - Optional: replace fetchListings with onSnapshot for live feed updates.
 *   - Optional: add `error` to context value for failed Firestore reads.
 *   - DashboardPage already uses useListings(); Firestore changes stay in listingService.
 *
 * See: docs/FIREBASE_INTEGRATION.md
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as listingService from '../services/listingService'
import type {
  CreateListingInput,
  Listing,
  UpdateListingInput,
} from '../types/listing'

type ListingsContextValue = {
  listings: Listing[]
  featuredListings: Listing[]
  loading: boolean
  error: string | null
  refreshListings: () => Promise<void>
  createListing: (input: CreateListingInput) => Promise<Listing>
  updateListing: (id: string, input: UpdateListingInput) => Promise<Listing>
  deleteListing: (id: string) => Promise<void>
}

const ListingsContext = createContext<ListingsContextValue | null>(null)

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshListings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listingService.fetchListings()
      setListings(data)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load listings.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshListings()

    // FIREBASE TODO: optional real-time listener, e.g.
    // const unsub = onSnapshot(collection(db, 'listings'), (snap) => { ... })
    // return () => unsub()
  }, [refreshListings])

  const addListing = useCallback(
    async (input: CreateListingInput) => {
      const created = await listingService.createListing(input)
      setListings((current) => [created, ...current])
      return created
    },
    [],
  )

  const createListing = addListing

  const featuredListings = useMemo(() => {
    return [...listings].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3)
  }, [listings])

  const updateListing = useCallback(
    async (id: string, input: UpdateListingInput) => {
      const updated = await listingService.updateListing(id, input)
      setListings((current) => current.map((l) => (l.id === id ? updated : l)))
      return updated
    },
    [],
  )

  const deleteListing = useCallback(
    async (id: string) => {
      await listingService.deleteListing(id)
      setListings((current) => current.filter((l) => l.id !== id))
    },
    [],
  )

  const value = useMemo(
    () => ({
      listings,
      featuredListings,
      loading,
      error,
      refreshListings,
      createListing,
      updateListing,
      deleteListing,
    }),
    [listings, featuredListings, loading, error, refreshListings, createListing, updateListing, deleteListing],
  )

  return (
    <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>
  )
}

export function useListings() {
  const context = useContext(ListingsContext)
  if (!context) {
    throw new Error('useListings must be used within ListingsProvider')
  }
  return context
}
