/**
 * Shared listing state for the React app.
 *
 * FIREBASE (teammate):
 *   - This file should keep calling src/services/listingService.ts only.
 *   - Optional: replace fetchListings with onSnapshot for live feed updates.
 *   - Optional: add `error` to context value for failed Firestore reads.
 *   - After Firestore works, update DashboardPage to use useListings() instead of mockListings.
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
import type { CreateListingInput, Listing } from '../types/listing'

type ListingsContextValue = {
  listings: Listing[]
  loading: boolean
  refreshListings: () => Promise<void>
  addListing: (input: CreateListingInput) => Promise<Listing>
  getListingById: (id: string) => Listing | undefined
}

const ListingsContext = createContext<ListingsContextValue | null>(null)

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  const refreshListings = useCallback(async () => {
    setLoading(true)
    const data = await listingService.fetchListings()
    setListings(data)
    setLoading(false)
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

  const getListingById = useCallback(
    (id: string) => listings.find((listing) => listing.id === id),
    [listings],
  )

  const value = useMemo(
    () => ({
      listings,
      loading,
      refreshListings,
      addListing,
      getListingById,
    }),
    [listings, loading, refreshListings, addListing, getListingById],
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
