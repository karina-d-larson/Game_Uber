import type {
  ArrangementType,
  CreateListingInput,
  ExchangeOption,
  ListingPurpose,
  ListingType,
  UpdateListingInput,
} from '../types/listing'

/** Map legacy `free` and new values to canonical exchange options. */
export function toExchangeOption(value: unknown): ExchangeOption | undefined {
  if (value === 'rent' || value === 'trade' || value === 'borrow') return value
  if (value === 'free') return 'borrow'
  return undefined
}

/** Resolve listing purpose from new or legacy document/input fields. */
export function toListingPurpose(
  listingPurpose: unknown,
  listingType?: unknown,
): ListingPurpose {
  if (listingPurpose === 'offer' || listingPurpose === 'request') return listingPurpose
  if (listingType === 'wanted') return 'request'
  return 'offer'
}

/** Legacy feed toggle value derived from listingPurpose. */
export function listingPurposeToListingType(purpose: ListingPurpose): ListingType {
  return purpose === 'request' ? 'wanted' : 'lending'
}

export function resolveListingPurposeFromInput(input: {
  listingPurpose?: ListingPurpose
  listingType?: ListingType
}): ListingPurpose {
  if (input.listingPurpose) return input.listingPurpose
  return toListingPurpose(undefined, input.listingType)
}

export function normalizeOfferArrangement(
  raw: unknown,
): ExchangeOption | undefined {
  return toExchangeOption(raw)
}

export function getExchangeOptionLabel(option: ExchangeOption): string {
  switch (option) {
    case 'rent':
      return 'Rent'
    case 'trade':
      return 'Trade'
    case 'borrow':
      return 'Borrow'
  }
}

export function normalizeTutorialUrl(
  url: string | undefined,
  purpose: ListingPurpose,
): string | undefined {
  if (purpose !== 'offer') return undefined
  const trimmed = url?.trim()
  return trimmed ? trimmed : undefined
}

/** Normalize categories from array + legacy single `category` field. */
export function normalizeListingCategories(
  categoriesRaw: unknown,
  legacyCategory?: unknown,
): { categories: string[]; category: string } {
  const fromArray = Array.isArray(categoriesRaw)
    ? categoriesRaw
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean)
    : []

  const unique = [...new Set(fromArray)]
  if (unique.length > 0) {
    return { categories: unique, category: unique[0]! }
  }

  const legacy =
    typeof legacyCategory === 'string' && legacyCategory.trim()
      ? legacyCategory.trim()
      : ''
  if (legacy) {
    return { categories: [legacy], category: legacy }
  }

  return { categories: [], category: '' }
}

export function categoriesFromInput(input: {
  categories?: string[]
  category?: string
}): { categories: string[]; category: string } {
  if (input.categories && input.categories.length > 0) {
    const unique = [
      ...new Set(input.categories.map((value) => value.trim()).filter(Boolean)),
    ]
    if (unique.length > 0) {
      return { categories: unique, category: unique[0]! }
    }
  }

  const legacy = input.category?.trim()
  if (legacy) {
    return { categories: [legacy], category: legacy }
  }

  return { categories: [], category: '' }
}

export function normalizeRequestOptions(
  raw: unknown,
  legacyArrangement?: unknown,
): ExchangeOption[] | undefined {
  const fromArray = Array.isArray(raw)
    ? raw
        .map(toExchangeOption)
        .filter((option): option is ExchangeOption => option != null)
    : []

  const unique = [...new Set(fromArray)]
  if (unique.length > 0) return unique

  const legacy = toExchangeOption(legacyArrangement)
  return legacy ? [legacy] : undefined
}

export type PurposeFields = {
  listingPurpose: ListingPurpose
  listingType: ListingType
  arrangementType?: ExchangeOption
  requestOptions?: ExchangeOption[]
}

/** Normalize purpose-specific exchange fields from create/update input. */
export function resolvePurposeFields(input: {
  listingPurpose?: ListingPurpose
  listingType?: ListingType
  arrangementType?: ArrangementType
  requestOptions?: ExchangeOption[]
}): PurposeFields {
  const listingPurpose = resolveListingPurposeFromInput(input)
  const listingType = listingPurposeToListingType(listingPurpose)

  if (listingPurpose === 'offer') {
    return {
      listingPurpose,
      listingType,
      arrangementType: normalizeOfferArrangement(input.arrangementType),
      requestOptions: undefined,
    }
  }

  return {
    listingPurpose,
    listingType,
    arrangementType: undefined,
    requestOptions: normalizeRequestOptions(
      input.requestOptions,
      input.arrangementType,
    ),
  }
}

/** Fields written to Firestore on create. */
export function buildFirestoreCreatePayload(
  input: CreateListingInput,
  owner: { id: string; displayName: string },
): Record<string, unknown> {
  const purposeFields = resolvePurposeFields(input)
  const categoryFields = categoriesFromInput(input)

  return {
    title: input.title.trim(),
    description: input.description.trim(),
    category: categoryFields.category,
    categories: categoryFields.categories,
    condition: input.condition,
    availability: input.availability,
    ownerId: owner.id,
    ownerName: owner.displayName,
    imageUrls: [],
    listingPurpose: purposeFields.listingPurpose,
    listingType: purposeFields.listingType,
    arrangementType: purposeFields.arrangementType ?? null,
    requestOptions: purposeFields.requestOptions ?? null,
    pricePerDay:
      purposeFields.listingPurpose === 'offer' && purposeFields.arrangementType === 'rent'
        ? (input.pricePerDay ?? null)
        : null,
    location: input.location?.trim() ?? null,
    meetupPreferences: input.meetupPreferences?.trim() ?? null,
    tutorialUrl:
      purposeFields.listingPurpose === 'offer'
        ? normalizeTutorialUrl(input.tutorialUrl, 'offer') ?? null
        : null,
  }
}

/** Map update input to Firestore-safe fields (excludes imageFiles). */
export function buildFirestoreUpdatePayload(
  input: UpdateListingInput,
  existingPurpose?: ListingPurpose,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  if (input.title != null) payload.title = input.title.trim()
  if (input.description != null) payload.description = input.description.trim()
  if (input.category != null) payload.category = input.category.trim()
  if (input.categories != null) {
    const normalized = categoriesFromInput({
      categories: input.categories,
      category: input.category,
    })
    payload.category = normalized.category
    payload.categories = normalized.categories
  }
  if (input.condition != null) payload.condition = input.condition
  if (input.availability != null) payload.availability = input.availability
  if (input.location != null) payload.location = input.location.trim()
  if (input.meetupPreferences != null) {
    payload.meetupPreferences = input.meetupPreferences.trim()
  }
  if (input.tutorialUrl !== undefined) {
    const purpose =
      (payload.listingPurpose as ListingPurpose | undefined) ?? existingPurpose ?? 'offer'
    payload.tutorialUrl =
      purpose === 'offer'
        ? normalizeTutorialUrl(input.tutorialUrl, 'offer') ?? null
        : null
  }

  const hasPurposeInput =
    input.listingPurpose != null ||
    input.listingType != null ||
    input.arrangementType != null ||
    input.requestOptions != null

  if (hasPurposeInput) {
    const purposeFields = resolvePurposeFields({
      listingPurpose: input.listingPurpose ?? existingPurpose,
      listingType: input.listingType,
      arrangementType: input.arrangementType,
      requestOptions: input.requestOptions,
    })
    payload.listingPurpose = purposeFields.listingPurpose
    payload.listingType = purposeFields.listingType
    payload.arrangementType = purposeFields.arrangementType ?? null
    payload.requestOptions = purposeFields.requestOptions ?? null

    if (purposeFields.listingPurpose === 'request') {
      payload.pricePerDay = null
      payload.tutorialUrl = null
    }
  }

  if (input.pricePerDay !== undefined) {
    const purpose =
      (payload.listingPurpose as ListingPurpose | undefined) ?? existingPurpose ?? 'offer'
    const arrangement =
      (payload.arrangementType as ExchangeOption | null | undefined) ?? undefined
    if (purpose === 'offer' && arrangement === 'rent') {
      payload.pricePerDay = input.pricePerDay
    } else if (purpose === 'offer') {
      payload.pricePerDay = null
    }
  }

  return payload
}
