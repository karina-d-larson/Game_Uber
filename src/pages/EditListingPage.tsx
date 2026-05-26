import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ListingForm } from '../components/ListingForm'
import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { useListings } from '../context/ListingsContext'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../routes/paths'
import type { Listing, UpdateListingInput } from '../types/listing'
import * as listingService from '../services/listingService'

export function EditListingPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { updateListing } = useListings()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [listing, setListing] = useState<Listing | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const found = await listingService.getListingById(id)
        if (cancelled) return
        setListing(found ?? null)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load listing.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <Page header={<PageHeader variant="create" title="Edit listing" back="history" />}>
        <p className="text-body-md text-on-surface-variant">Loading…</p>
      </Page>
    )
  }

  if (error || !listing) {
    return (
      <Page header={<PageHeader variant="create" title="Edit listing" back="history" />}>
        <p className="font-headline-md text-headline-md">Listing not found</p>
        {error && <p className="mt-sm text-body-md text-on-surface-variant">{error}</p>}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-md min-h-11 rounded-lg bg-secondary px-lg py-3 font-label-md text-label-md text-on-secondary"
        >
          Back
        </button>
      </Page>
    )
  }

  if (!user || listing.ownerId !== user.id) {
    return (
      <Page header={<PageHeader variant="create" title="Edit listing" back="history" />}>
        <p className="font-headline-md text-headline-md">Not allowed</p>
        <p className="mt-sm text-body-md text-on-surface-variant">
          You can only edit your own listings.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-md min-h-11 rounded-lg bg-secondary px-lg py-3 font-label-md text-label-md text-on-secondary"
        >
          Back
        </button>
      </Page>
    )
  }

  return (
    <Page header={<PageHeader variant="create" title="Edit listing" back="history" />}>
      <div className="mx-auto max-w-2xl">
        <ListingForm
          mode="edit"
          initial={listing}
          submitting={submitting}
          submitLabel="Save changes"
          onCancel={() => navigate(-1)}
          onSubmit={async (input) => {
            if (!id) return
            setSubmitting(true)
            setError(null)
            try {
              const updated = await updateListing(id, input as UpdateListingInput)
              navigate(ROUTES.listing(updated.id), {
                replace: true,
                state: { listing: updated },
              })
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Could not update listing.')
            } finally {
              setSubmitting(false)
            }
          }}
          formError={error}
        />
      </div>
    </Page>
  )
}
