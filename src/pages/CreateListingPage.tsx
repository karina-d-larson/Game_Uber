import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListingForm } from '../components/ListingForm'
import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { useListings } from '../context/ListingsContext'
import { ROUTES } from '../routes/paths'
import type { CreateListingInput } from '../types/listing'

export function CreateListingPage() {
  const navigate = useNavigate()
  const { createListing } = useListings()
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  return (
    <Page header={<PageHeader variant="create" back="history" />}>
      <div className="mx-auto max-w-2xl">
        <ListingForm
          mode="create"
          submitting={submitting}
          submitLabel="Post Listing"
          formError={formError}
          onCancel={() => navigate(ROUTES.home)}
          onSubmit={async (input) => {
            setFormError(null)
            setSubmitting(true)
            try {
              await createListing(input as CreateListingInput)
              navigate(ROUTES.home)
            } catch (e) {
              setFormError(e instanceof Error ? e.message : 'Could not create listing.')
            } finally {
              setSubmitting(false)
            }
          }}
        />
      </div>
    </Page>
  )
}
