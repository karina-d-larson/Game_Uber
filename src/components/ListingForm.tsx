import { useMemo, useState, type FormEvent } from 'react'
import type {
  ArrangementType,
  CreateListingInput,
  Listing,
  ListingAvailability,
  ListingType,
  UpdateListingInput,
} from '../types/listing'
import { LISTING_CATEGORY_OPTIONS } from '../config/listingCategories'
import { MaterialIcon } from './MaterialIcon'
import { ImageUploader } from './ImageUploader'

const CONDITIONS = ['Like New', 'Good', 'Well Used', 'Acceptable'] as const

const ARRANGEMENT_OPTIONS: {
  value: ArrangementType
  label: string
  description: string
}[] = [
  { value: 'rent', label: 'Rent', description: 'Charge per day' },
  { value: 'trade', label: 'Trade', description: 'Swap for another game' },
  { value: 'free', label: 'Free Lend', description: 'No payment' },
]

type ListingFormMode = 'create' | 'edit'

type ListingFormProps = {
  mode: ListingFormMode
  initial?: Listing
  onSubmit: (input: CreateListingInput | UpdateListingInput) => Promise<void>
  submitting: boolean
  submitLabel: string
  onCancel: () => void
  formError?: string | null
}

type FormState = {
  title: string
  category: string
  condition: string
  arrangementType: ArrangementType
  listingType: ListingType
  availability: ListingAvailability
  pricePerDay: string
  description: string
  meetupPreferences: string
  location: string
}

function toFormState(initial?: Listing): FormState {
  return {
    title: initial?.title ?? '',
    category: initial?.category ?? 'Strategy',
    condition: initial?.condition ?? 'Like New',
    arrangementType: initial?.arrangementType ?? 'rent',
    listingType: initial?.listingType ?? 'lending',
    availability: initial?.availability ?? 'available',
    pricePerDay: initial?.pricePerDay != null ? String(initial.pricePerDay) : '',
    description: initial?.description ?? '',
    meetupPreferences: initial?.meetupPreferences ?? '',
    location: initial?.location ?? '',
  }
}

export function ListingForm({
  mode,
  initial,
  onSubmit,
  submitting,
  submitLabel,
  onCancel,
  formError,
}: ListingFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initial))
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!form.title.trim()) next.title = 'Game title is required.'
    if (!form.description.trim()) next.description = 'Description is required.'
    if (!form.category.trim()) next.category = 'Category is required.'
    if (!form.condition.trim()) next.condition = 'Condition is required.'
    if (!form.location.trim()) next.location = 'Location is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const listingModeIsLending = form.listingType === 'lending'
  const availabilityLabel = useMemo(() => {
    return form.availability === 'available' ? 'Available' : 'Unavailable'
  }, [form.availability])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validate()) return

    if (mode === 'create') {
      const input: CreateListingInput = {
        title: form.title,
        description: form.description,
        category: form.category,
        listingType: form.listingType,
        condition: form.condition,
        availability: form.availability,
        imageFiles,
        arrangementType: form.arrangementType,
        pricePerDay:
          form.pricePerDay.trim() !== ''
            ? Number.parseFloat(form.pricePerDay)
            : undefined,
        location: form.location,
        meetupPreferences: form.meetupPreferences,
      }
      await onSubmit(input)
      return
    }

    const update: UpdateListingInput = {
      title: form.title,
      description: form.description,
      category: form.category,
      listingType: form.listingType,
      condition: form.condition,
      availability: form.availability,
      arrangementType: form.arrangementType,
      pricePerDay:
        form.pricePerDay.trim() !== ''
          ? Number.parseFloat(form.pricePerDay)
          : undefined,
      location: form.location,
      meetupPreferences: form.meetupPreferences,
      imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
    }
    await onSubmit(update)
  }

  return (
    <form className="space-y-xl" onSubmit={handleSubmit} noValidate>
      {formError && (
        <p
          className="rounded-lg border border-error/30 bg-error/5 px-md py-sm text-body-md text-error"
          role="alert"
        >
          {formError}
        </p>
      )}

      <ImageUploader
        labelId="listing-photo"
        value={imageFiles}
        onChange={(files) => {
          setImageFiles(files)
          setErrors((current) => {
            const next = { ...current }
            delete next.image
            return next
          })
        }}
        error={errors.image}
        maxFiles={1}
      />

      <div className="grid grid-cols-1 gap-md md:grid-cols-2">
        <div className="col-span-full">
          <label className="mb-2 block font-label-md text-label-md text-on-surface-variant">
            Game Title
          </label>
          <input
            className="boardlink-field"
            placeholder="e.g. Scythe, Terraforming Mars"
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
          />
          {errors.title && <p className="mt-1 text-body-md text-error">{errors.title}</p>}
        </div>

        <div>
          <label className="mb-2 block font-label-md text-label-md text-on-surface-variant">
            Genre
          </label>
          <select
            className="boardlink-field appearance-none"
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
          >
            {LISTING_CATEGORY_OPTIONS.map((genre) => (
              <option key={genre}>{genre}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-body-md text-error">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block font-label-md text-label-md text-on-surface-variant">
            Condition
          </label>
          <select
            className="boardlink-field appearance-none"
            value={form.condition}
            onChange={(e) => updateField('condition', e.target.value)}
          >
            {CONDITIONS.map((condition) => (
              <option key={condition}>{condition}</option>
            ))}
          </select>
          {errors.condition && (
            <p className="mt-1 text-body-md text-error">{errors.condition}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-2 block font-label-md text-label-md text-on-surface-variant">
          Listing type
        </label>
        <div className="flex rounded-xl bg-surface-container-high p-1">
          <button
            type="button"
            onClick={() => updateField('listingType', 'lending')}
            className={
              listingModeIsLending
                ? 'flex-1 rounded-lg bg-surface py-3 text-center font-semibold text-secondary shadow-sm'
                : 'flex-1 rounded-lg py-3 text-center text-on-surface-variant hover:bg-surface-container-highest transition-colors'
            }
          >
            UP FOR LENDING
          </button>
          <button
            type="button"
            onClick={() => updateField('listingType', 'wanted')}
            className={
              !listingModeIsLending
                ? 'flex-1 rounded-lg bg-surface py-3 text-center font-semibold text-secondary shadow-sm'
                : 'flex-1 rounded-lg py-3 text-center text-on-surface-variant hover:bg-surface-container-highest transition-colors'
            }
          >
            WANT TO RENT
          </button>
        </div>
      </div>

      <div className="space-y-md">
        <div>
          <label className="mb-2 block font-label-md text-label-md text-on-surface-variant">
            Arrangement
          </label>
          <div className="grid grid-cols-1 gap-sm sm:grid-cols-3">
            {ARRANGEMENT_OPTIONS.map((option) => {
              const selected = form.arrangementType === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField('arrangementType', option.value)}
                  className={
                    selected
                      ? 'rounded-xl border-2 border-secondary bg-secondary/5 p-4 text-left'
                      : 'rounded-xl border border-outline-variant bg-surface p-4 text-left hover:bg-surface-container-low'
                  }
                >
                  <p className="font-semibold text-body-md">{option.label}</p>
                  <p className="text-label-md text-on-surface-variant">
                    {option.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-outline-variant bg-surface p-4">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant">
              Availability
            </p>
            <p className="font-headline-md text-headline-md text-primary">
              {availabilityLabel}
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg bg-surface-container-high px-md py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-highest"
            onClick={() =>
              updateField(
                'availability',
                form.availability === 'available' ? 'unavailable' : 'available',
              )
            }
          >
            Toggle
          </button>
        </div>

        {form.arrangementType === 'rent' && (
          <div>
            <label className="mb-2 block font-label-md text-label-md text-on-surface-variant">
              Price per day (Optional)
            </label>
            <div className="relative">
              <span className="absolute top-1/2 left-md -translate-y-1/2 text-on-surface-variant">
                $
              </span>
              <input
                className="boardlink-field pl-8"
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                value={form.pricePerDay}
                onChange={(e) => updateField('pricePerDay', e.target.value)}
              />
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 block font-label-md text-label-md text-on-surface-variant">
            Description
          </label>
          <textarea
            className="boardlink-field min-h-[6rem] resize-y"
            placeholder="Tell us about the game condition, missing pieces, or house rules..."
            rows={4}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
          />
          {errors.description && (
            <p className="mt-1 text-body-md text-error">{errors.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-md border-t border-outline-variant pt-xl">
        <h3 className="font-headline-md text-headline-md">Logistics</h3>
        <div>
          <label className="mb-2 block font-label-md text-label-md text-on-surface-variant">
            Meetup Preferences
          </label>
          <input
            className="boardlink-field"
            placeholder="e.g. Near Central Station, weekends only"
            type="text"
            value={form.meetupPreferences}
            onChange={(e) => updateField('meetupPreferences', e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block font-label-md text-label-md text-on-surface-variant">
            Primary Location
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MaterialIcon
                name="location_on"
                className="absolute top-1/2 left-md -translate-y-1/2 text-outline"
              />
              <input
                className="boardlink-field pl-10"
                placeholder="City, neighborhood, or campus"
                type="text"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
              />
            </div>
            <button
              className="rounded-lg bg-surface-container-high px-md transition-colors hover:bg-surface-container-highest"
              type="button"
              aria-label="Use current location (not implemented)"
            >
              <MaterialIcon name="my_location" />
            </button>
          </div>
          {errors.location && (
            <p className="mt-1 text-body-md text-error">{errors.location}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-sm pt-xl pb-12">
        <button
          className="w-full rounded-xl bg-secondary py-4 text-lg font-bold text-on-secondary shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
        <button
          className="w-full rounded-xl bg-transparent py-4 font-semibold text-on-surface-variant transition-all hover:bg-surface-container-high"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

