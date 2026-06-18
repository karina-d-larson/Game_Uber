import { useMemo, useState, type FormEvent } from 'react'
import type {
  CreateListingInput,
  ExchangeOption,
  Listing,
  ListingAvailability,
  ListingPurpose,
  UpdateListingInput,
} from '../types/listing'
import { LISTING_CATEGORY_OPTIONS } from '../config/listingCategories'
import { listingPurposeToListingType, toListingPurpose } from '../utils/listingMapping'
import { getListingCategories } from '../utils/listingCategories'
import { MaterialIcon } from './MaterialIcon'
import { ImageUploader } from './ImageUploader'

const CONDITIONS = ['Like New', 'Good', 'Well Used', 'Acceptable'] as const

const REQUEST_DEFAULT_CONDITION = 'Any'

const PURPOSE_OPTIONS: {
  value: ListingPurpose
  label: string
  helper: string
}[] = [
  {
    value: 'offer',
    label: 'Offer a game',
    helper: 'I have a game others can borrow, rent, or trade for.',
  },
  {
    value: 'request',
    label: 'Request a game',
    helper:
      "I'm looking for a game someone else might lend, rent, or trade.",
  },
]

const REQUEST_OPTION_CHOICES: {
  value: ExchangeOption
  label: string
  description: string
}[] = [
  { value: 'rent', label: 'Renting', description: "I'm willing to pay" },
  { value: 'trade', label: 'Trading', description: "I'm willing to swap" },
  {
    value: 'borrow',
    label: 'Borrowing for free',
    description: "I'm hoping to borrow",
  },
]

const ARRANGEMENT_OPTIONS: {
  value: ExchangeOption
  label: string
  description: string
}[] = [
  { value: 'rent', label: 'Rent out', description: 'Charge a daily price' },
  { value: 'trade', label: 'Trade', description: 'Swap for another game' },
  { value: 'borrow', label: 'Lend for free', description: 'No payment' },
]

function isValidTutorialUrl(url: string): boolean {
  if (!url.trim()) return true
  try {
    const parsed = new URL(url.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

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
  categories: string[]
  condition: string
  arrangementType: ExchangeOption
  listingPurpose: ListingPurpose
  requestOptions: ExchangeOption[]
  availability: ListingAvailability
  pricePerDay: string
  description: string
  meetupPreferences: string
  location: string
  tutorialUrl: string
}

function arrangementToFormValue(type?: ExchangeOption): ExchangeOption {
  return type ?? 'rent'
}

function toFormState(initial?: Listing): FormState {
  const listingPurpose = initial
    ? toListingPurpose(initial.listingPurpose, initial.listingType)
    : 'offer'

  return {
    title: initial?.title ?? '',
    categories: initial ? getListingCategories(initial) : ['Strategy'],
    condition: initial?.condition ?? 'Like New',
    arrangementType: arrangementToFormValue(initial?.arrangementType),
    listingPurpose,
    requestOptions: initial?.requestOptions ?? [],
    availability: initial?.availability ?? 'available',
    pricePerDay: initial?.pricePerDay != null ? String(initial.pricePerDay) : '',
    description: initial?.description ?? '',
    meetupPreferences: initial?.meetupPreferences ?? '',
    location: initial?.location ?? '',
    tutorialUrl: initial?.tutorialUrl ?? '',
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

  const isOffer = form.listingPurpose === 'offer'
  const isRequest = form.listingPurpose === 'request'

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function setListingPurpose(purpose: ListingPurpose) {
    if (purpose === form.listingPurpose) return

    if (purpose === 'request') {
      setForm((current) => ({
        ...current,
        listingPurpose: 'request',
        pricePerDay: '',
        arrangementType: 'rent',
        condition: REQUEST_DEFAULT_CONDITION,
        tutorialUrl: '',
        availability: 'available',
        requestOptions: current.requestOptions.length > 0 ? current.requestOptions : [],
      }))
      setImageFiles([])
    } else {
      setForm((current) => ({
        ...current,
        listingPurpose: 'offer',
        requestOptions: [],
        condition: current.condition === REQUEST_DEFAULT_CONDITION ? 'Like New' : current.condition,
        arrangementType: current.arrangementType || 'rent',
      }))
    }

    setErrors((current) => {
      const next = { ...current }
      delete next.requestOptions
      delete next.image
      delete next.condition
      delete next.arrangementType
      delete next.tutorialUrl
      return next
    })
  }

  function setOfferArrangement(value: ExchangeOption) {
    setForm((current) => ({
      ...current,
      arrangementType: value,
      pricePerDay: value === 'rent' ? current.pricePerDay : '',
    }))
    setErrors((current) => {
      const next = { ...current }
      delete next.arrangementType
      return next
    })
  }

  function toggleRequestOption(option: ExchangeOption) {
    setForm((current) => {
      const selected = current.requestOptions.includes(option)
      const requestOptions = selected
        ? current.requestOptions.filter((value) => value !== option)
        : [...current.requestOptions, option]
      return { ...current, requestOptions }
    })
    setErrors((current) => {
      const next = { ...current }
      delete next.requestOptions
      return next
    })
  }

  function toggleCategory(category: string) {
    setForm((current) => {
      const selected = current.categories.includes(category)
      const categories = selected
        ? current.categories.filter((value) => value !== category)
        : [...current.categories, category]
      return { ...current, categories }
    })
    setErrors((current) => {
      const next = { ...current }
      delete next.categories
      return next
    })
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!form.title.trim()) next.title = 'Game title is required.'
    if (form.categories.length === 0) {
      next.categories = 'Select at least one category.'
    }
    if (!form.location.trim()) next.location = 'Location is required.'

    if (isOffer) {
      if (!form.condition.trim()) next.condition = 'Condition is required.'
    }

    if (isRequest && form.requestOptions.length === 0) {
      next.requestOptions = 'Select at least one option you are open to.'
    }

    if (isOffer && !isValidTutorialUrl(form.tutorialUrl)) {
      next.tutorialUrl = 'Please enter a valid video link.'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const availabilityLabel = useMemo(() => {
    return form.availability === 'available' ? 'Available' : 'Unavailable'
  }, [form.availability])

  const offerPricePerDay =
    form.arrangementType === 'rent' && form.pricePerDay.trim() !== ''
      ? Number.parseFloat(form.pricePerDay)
      : undefined

  const offerTutorialUrl = form.tutorialUrl.trim() || undefined

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validate()) return

    const listingType = listingPurposeToListingType(form.listingPurpose)
    const categoryFields = {
      categories: form.categories,
      category: form.categories[0] ?? '',
    }
    const description = form.description.trim()

    if (mode === 'create') {
      if (isRequest) {
        const input: CreateListingInput = {
          title: form.title,
          description,
          ...categoryFields,
          listingPurpose: 'request',
          listingType,
          condition: form.condition,
          availability: 'available',
          imageFiles: [],
          requestOptions: form.requestOptions,
          location: form.location,
          meetupPreferences: form.meetupPreferences,
        }
        await onSubmit(input)
        return
      }

      const input: CreateListingInput = {
        title: form.title,
        description,
        ...categoryFields,
        listingPurpose: 'offer',
        listingType,
        condition: form.condition,
        availability: form.availability,
        imageFiles,
        arrangementType: form.arrangementType,
        pricePerDay: offerPricePerDay,
        tutorialUrl: offerTutorialUrl,
        location: form.location,
        meetupPreferences: form.meetupPreferences,
      }
      await onSubmit(input)
      return
    }

    if (isRequest) {
      const update: UpdateListingInput = {
        title: form.title,
        description,
        ...categoryFields,
        listingPurpose: 'request',
        listingType,
        requestOptions: form.requestOptions,
        location: form.location,
        meetupPreferences: form.meetupPreferences,
      }
      await onSubmit(update)
      return
    }

    const update: UpdateListingInput = {
      title: form.title,
      description,
      ...categoryFields,
      listingPurpose: 'offer',
      listingType,
      condition: form.condition,
      availability: form.availability,
      arrangementType: form.arrangementType,
      pricePerDay: offerPricePerDay,
      tutorialUrl: offerTutorialUrl ?? '',
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

      <div>
        <h2 className="mb-md font-headline-md text-headline-md">What are you posting?</h2>
        <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
          {PURPOSE_OPTIONS.map((option) => {
            const selected = form.listingPurpose === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setListingPurpose(option.value)}
                className={
                  selected
                    ? 'rounded-xl border-2 border-secondary bg-secondary/5 p-4 text-left'
                    : 'rounded-xl border border-outline-variant bg-surface p-4 text-left hover:bg-surface-container-low'
                }
              >
                <p className="font-semibold text-body-md">{option.label}</p>
                <p className="mt-1 text-label-md text-on-surface-variant">
                  {option.helper}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-md md:grid-cols-2">
        <div className="col-span-full">
          <label className="mb-2 block font-label-md text-label-md text-on-surface-variant">
            Game Title
          </label>
          <input
            className="gameshelf-field"
            placeholder="e.g. Scythe, Terraforming Mars"
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
          />
          {errors.title && <p className="mt-1 text-body-md text-error">{errors.title}</p>}
        </div>

        <div className="col-span-full">
          <label className="mb-2 block font-label-md text-label-md text-on-surface-variant">
            Game categories
          </label>
          <p className="mb-sm text-label-md text-on-surface-variant">
            Select all that apply.
          </p>
          <div className="flex flex-wrap gap-sm">
            {LISTING_CATEGORY_OPTIONS.map((category) => {
              const selected = form.categories.includes(category)
              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleCategory(category)}
                  className={
                    selected
                      ? 'min-h-11 rounded-full bg-secondary px-md py-xs font-label-md text-label-md text-on-secondary'
                      : 'min-h-11 rounded-full bg-surface-container-high px-md py-xs font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-highest'
                  }
                >
                  {category}
                </button>
              )
            })}
          </div>
          {errors.categories && (
            <p className="mt-1 text-body-md text-error">{errors.categories}</p>
          )}
        </div>

        {isOffer && (
          <div>
            <label className="mb-2 block font-label-md text-label-md text-on-surface-variant">
              Condition
            </label>
            <select
              className="gameshelf-field appearance-none"
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
        )}
      </div>

      {isRequest && (
        <div>
          <label className="mb-2 block font-label-md text-label-md text-on-surface-variant">
            What options are you open to?
          </label>
          <div className="grid grid-cols-1 gap-sm sm:grid-cols-3">
            {REQUEST_OPTION_CHOICES.map((option) => {
              const selected = form.requestOptions.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleRequestOption(option.value)}
                  aria-pressed={selected}
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
          {errors.requestOptions && (
            <p className="mt-1 text-body-md text-error">{errors.requestOptions}</p>
          )}
        </div>
      )}

      {isOffer && (
        <div className="space-y-md">
          <div>
            <label className="mb-2 block font-label-md text-label-md text-on-surface-variant">
              How do you want to share it?
            </label>
            <div className="grid grid-cols-1 gap-sm sm:grid-cols-3">
              {ARRANGEMENT_OPTIONS.map((option) => {
                const selected = form.arrangementType === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setOfferArrangement(option.value)}
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
                  className="gameshelf-field pl-8"
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
        </div>
      )}

      <div>
        <label className="mb-2 block font-label-md text-label-md text-on-surface-variant">
          Description <span className="text-on-surface-variant">(optional)</span>
        </label>
        <textarea
          className="gameshelf-field min-h-[6rem] resize-y"
          placeholder={
            isRequest
              ? 'Optional: Mention when you need the game, how long you’d like to borrow it, or any other details.'
              : 'Optional: Mention missing pieces, expansions, sleeved cards, house rules, or anything borrowers should know.'
          }
          rows={4}
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
      </div>

      <div className="space-y-md border-t border-outline-variant pt-xl">
        <h3 className="font-headline-md text-headline-md">Logistics</h3>
        <div>
          <label className="mb-2 block font-label-md text-label-md text-on-surface-variant">
            Meetup Preferences
          </label>
          <input
            className="gameshelf-field"
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
                className="gameshelf-field pl-10"
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

      {isOffer && (
        <div className="space-y-md border-t border-outline-variant pt-xl">
          <div>
            <label
              htmlFor="listing-tutorial-url"
              className="mb-2 block font-label-md text-label-md text-on-surface-variant"
            >
              Game tutorial video link (optional)
            </label>
            <p className="mb-2 text-label-md text-on-surface-variant">
              Add a YouTube or rules video to help borrowers learn the game.
            </p>
            <input
              id="listing-tutorial-url"
              className="gameshelf-field"
              placeholder="https://www.youtube.com/watch?v=..."
              type="url"
              value={form.tutorialUrl}
              onChange={(e) => updateField('tutorialUrl', e.target.value)}
            />
            {errors.tutorialUrl && (
              <p className="mt-1 text-body-md text-error">{errors.tutorialUrl}</p>
            )}
          </div>

          <div>
            <h3 className="mb-1 font-headline-md text-headline-md">Photo (optional)</h3>
            <p className="mb-md text-label-md text-on-surface-variant">
              Add a photo of your game if you have one.
            </p>
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
              compact
              uploadLabel="Add photo"
              helperText="Optional — one photo is enough."
            />
          </div>
        </div>
      )}

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
