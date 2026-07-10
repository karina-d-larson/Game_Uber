# Remove Firebase Analytics

## Goal

Remove unused Firebase Analytics so the app does not crash without env vars.

## Current Status

- [x] **Complete** — July 2026

## Files Involved

- `src/lib/firebase.ts`
- `.env.example`

## Step-by-Step Implementation Checklist

- [x] Remove `getAnalytics` import and `analytics` export
- [x] Remove `measurementId` from config object
- [x] Grep for `analytics` usages — none remain
- [x] Run `npm run build`

## Acceptance Criteria

- [x] No `firebase/analytics` import
- [x] App loads without `.env` (warning only)
- [x] `npm run build` passes

## Manual Testing Checklist

- [x] `npm run build` succeeds

## Notes

Team decision: Analytics not needed.
