import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { MaterialIcon } from '../components/MaterialIcon'
import { useListings } from '../context/ListingsContext'
import type { ArrangementType, ListingMode } from '../types/listing'

const GENRES = ['Strategy', 'Party', 'Worker Placement', 'Cooperative', 'Family']
const CONDITIONS = ['Like New', 'Good', 'Well Used', 'Acceptable']

type FormState = {
  title: string
  category: string
  condition: string
  arrangementType: ArrangementType
  listingMode: ListingMode
  pricePerDay: string
  description: string
  meetupPreferences: string
  location: string
}

const initialForm: FormState = {
  title: '',
  category: 'Strategy',
  condition: 'Like New',
  arrangementType: 'rent',
  listingMode: 'lending',
  pricePerDay: '',
  description: '',
  meetupPreferences: '',
  location: 'San Francisco, CA',
}

export function CreateListingPage() {
  const navigate = useNavigate()
  const { addListing } = useListings()
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

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
    if (!form.location.trim()) next.location = 'Location is required.'
    if (form.arrangementType === 'rent' && !form.pricePerDay.trim()) {
      next.pricePerDay = 'Price per day is required for rentals.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      const created = await addListing({
        title: form.title,
        category: form.category,
        condition: form.condition,
        arrangementType: form.arrangementType,
        listingMode: form.listingMode,
        pricePerDay:
          form.arrangementType === 'rent'
            ? Number.parseFloat(form.pricePerDay)
            : undefined,
        description: form.description,
        location: form.location,
        meetupPreferences: form.meetupPreferences,
      })
      navigate(`/listings/${created.id}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Navbar variant="create" />

      <main className="mx-auto max-w-screen-xl px-gutter-mobile py-xl pb-24 md:px-gutter-desktop">
        <div className="mx-auto max-w-2xl">
          <div className="mb-xl flex rounded-xl bg-surface-container-high p-1">
            <button
              type="button"
              onClick={() => updateField('listingMode', 'lending')}
              className={
                form.listingMode === 'lending'
                  ? 'flex-1 rounded-lg bg-surface py-3 text-center font-semibold text-secondary shadow-sm'
                  : 'flex-1 rounded-lg py-3 text-center text-on-surface-variant hover:bg-surface-container-highest transition-colors'
              }
            >
              UP FOR LENDING
            </button>
            <button
              type="button"
              onClick={() => updateField('listingMode', 'wanted')}
              className={
                form.listingMode === 'wanted'
                  ? 'flex-1 rounded-lg bg-surface py-3 text-center font-semibold text-secondary shadow-sm'
                  : 'flex-1 rounded-lg py-3 text-center text-on-surface-variant hover:bg-surface-container-highest transition-colors'
              }
            >
              WANT TO RENT
            </button>
          </div>

          <form className="space-y-xl" onSubmit={handleSubmit} noValidate>
            <div className="group relative flex aspect-video cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low transition-colors hover:border-secondary">
              <img
                className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover:opacity-10"
                alt=""
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5AskxegN_GNGS0yItNT7I96fiHqflGxAISzuplgl0WTCdbI2R1kP2o5_16-nwqWVrSuKxnJzsakKKNtrfcVHxdg5V9IyUFCPp3_vj5Z_URR340_Lr65hHaraH4P6Cd76UwaobBkv59dQBBwjW0f6xBVar0vDlLgdp4ZyxquW82Ybd2XDw9d6A3Es7VGDw0X3FzQbXRx1mfXkBM_clNQgotM0RFJvsTHEPXeQtgbSg9iO8gCdEhpRwupFqcvHV1jLzaUpZPRPmqXo"
              />
              <MaterialIcon
                name="add_a_photo"
                className="mb-2 text-5xl text-outline-variant group-hover:text-secondary"
              />
              <p className="font-label-md text-label-md tracking-wider text-on-surface-variant uppercase">
                Upload Game Photos
              </p>
              <p className="mt-1 text-[10px] text-outline">
                Recommended: Front box art &amp; open components
              </p>
            </div>

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
                {errors.title && (
                  <p className="mt-1 text-body-md text-error">{errors.title}</p>
                )}
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
                  {GENRES.map((genre) => (
                    <option key={genre}>{genre}</option>
                  ))}
                </select>
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
              </div>
            </div>

            <div>
              <label className="mb-3 block font-label-md text-label-md text-on-surface-variant">
                Arrangement Options
              </label>
              <div className="grid grid-cols-3 gap-md">
                {(
                  [
                    { value: 'rent' as const, icon: 'payments', label: 'Rent' },
                    { value: 'trade' as const, icon: 'swap_horiz', label: 'Trade' },
                    {
                      value: 'free' as const,
                      icon: 'volunteer_activism',
                      label: 'Free lend',
                    },
                  ] as const
                ).map((option) => (
                  <label
                    key={option.value}
                    className="group relative flex cursor-pointer flex-col items-center rounded-xl border border-outline-variant bg-surface p-4 transition-all hover:border-secondary"
                  >
                    <input
                      className="peer hidden"
                      name="arrangement"
                      type="radio"
                      checked={form.arrangementType === option.value}
                      onChange={() => updateField('arrangementType', option.value)}
                    />
                    <MaterialIcon
                      name={option.icon}
                      className={`mb-2 group-hover:text-secondary ${
                        form.arrangementType === option.value
                          ? 'text-secondary'
                          : 'text-outline-variant'
                      }`}
                    />
                    <span className="text-label-md">{option.label}</span>
                    <div
                      className={`pointer-events-none absolute inset-0 rounded-xl ring-2 ring-secondary ${
                        form.arrangementType === option.value
                          ? 'opacity-100'
                          : 'opacity-0'
                      }`}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-md">
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
                  {errors.pricePerDay && (
                    <p className="mt-1 text-body-md text-error">{errors.pricePerDay}</p>
                  )}
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
                  onChange={(e) =>
                    updateField('meetupPreferences', e.target.value)
                  }
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
                      type="text"
                      value={form.location}
                      onChange={(e) => updateField('location', e.target.value)}
                    />
                  </div>
                  <button
                    className="rounded-lg bg-surface-container-high px-md transition-colors hover:bg-surface-container-highest"
                    type="button"
                  >
                    <MaterialIcon name="my_location" />
                  </button>
                </div>
                {errors.location && (
                  <p className="mt-1 text-body-md text-error">{errors.location}</p>
                )}
                <div className="relative mt-md h-32 overflow-hidden rounded-xl bg-surface-container-highest shadow-inner">
                  <img
                    className="h-full w-full object-cover opacity-60 grayscale"
                    alt=""
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCB5kUOzZkXYIp-NR1Z6-mszXKgmCrr6US93K2aV9p6eZGa-F8YHssdI8nekFbW12LbKtgljVn7YsyCIQJcmLJ7_rmAzojTndSeWqcAiU77jkoXcZsmNo5sCMKI5fkLPcLIKg3QmOPsZhRH1vYbEshXzCmlKizGmK0TmOGgjrpnpztN7hrZDFZiNpKvCSI64ZOH5YHiGqJud7QpOyi0LCieGTO0-2LsLKIZYF-4t7mK4mKq5i0IbFPEYkytsOiB0eBEtSfqDp9_XKo"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MaterialIcon
                      name="location_on"
                      filled
                      className="text-3xl text-secondary"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-sm pt-xl pb-12">
              <button
                className="w-full rounded-xl bg-secondary py-4 text-lg font-bold text-on-secondary shadow-lg transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Posting…' : 'Post Listing'}
              </button>
              <button
                className="w-full rounded-xl bg-transparent py-4 font-semibold text-on-surface-variant transition-all hover:bg-surface-container-high"
                type="button"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
