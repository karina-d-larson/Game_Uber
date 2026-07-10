# Seed Data Cleanup

## Goal

Stop auto-seeding listings/messages unless `VITE_DEV_SEED_DATA=true`.

## Current Status

- [x] **Complete** — July 2026

## Files Involved

- `src/config/devSeed.ts`
- `src/services/listingService.dev.ts`
- `src/services/messageService.dev.ts`
- `.env.example`
- `src/data/listings.ts` (deleted — unused duplicate breaking build)

## Step-by-Step Implementation Checklist

- [x] Add `isDevSeedDataEnabled()` helper
- [x] Gate listing seed in `listingService.dev.ts`
- [x] Gate message seed in `messageService.dev.ts` seedIfEmpty
- [x] Document `VITE_DEV_SEED_DATA` in `.env.example`
- [x] Remove unused `src/data/listings.ts`
- [x] Run `npm run build`

## Acceptance Criteria

- [x] Firestore listings unaffected
- [x] Local backend returns `[]` when no localStorage and seed flag off
- [x] Inbox empty without seed
- [x] Optional seed via env flag
- [x] `npm run build` passes

## Manual Testing Checklist

- [ ] Dashboard empty state with no data
- [ ] Inbox empty state with no data
- [ ] `VITE_DEV_SEED_DATA=true` restores seed in local mode

## Notes

- Do not delete Firestore documents
