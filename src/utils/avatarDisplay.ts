/** Legacy placeholder URL — treat as “no custom avatar” for initials fallback. */
export const LEGACY_DEFAULT_AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDKHIZ20m5AdsPygH7mo9GAuD80aTL1xPNpdImx_PbFWb2frljMf0-fa9nge7yqMfhFyaoBDh6ebxk3Gw4W7FyskHsCV8GEnP61EJoS7kCkTtOeZ5DoilGGfNxKrkO4uQYnWY68kDyGSEOszS1csnfhTtXjjNVAxzPydRi1ChhsLJL0i2_KYXFjiuG3wqA0yiAkjW2HFNlQk3HJ6pv_AobcvOdPxIVOlOEGe78QMDjrvw8r3MQ9XRbkv05WoJl0boYQlLJFe_Z-7g'

export function getInitials(displayName: string, username: string): string {
  const name = displayName.trim() || username.trim() || 'GS'
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export function isDisplayableAvatarUrl(avatar: string | undefined): boolean {
  const value = avatar?.trim()
  if (!value) return false
  if (value === LEGACY_DEFAULT_AVATAR_URL) return false
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function normalizeAvatarFromDoc(value: unknown): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim()
  if (!trimmed || trimmed === LEGACY_DEFAULT_AVATAR_URL) return ''
  return trimmed
}
