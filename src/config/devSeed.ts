/**
 * Opt-in local seed data for listings and messaging dev backends.
 *
 * Default: off — empty feed/inbox until user creates data.
 * Enable in `.env` for solo dev with sample listings/messages:
 *   VITE_DEV_SEED_DATA=true
 */

export function isDevSeedDataEnabled(): boolean {
  return import.meta.env.VITE_DEV_SEED_DATA === 'true'
}
