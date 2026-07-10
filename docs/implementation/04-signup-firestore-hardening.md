# Signup Firestore Hardening

## Goal

Use `requireFirestoreDb()` for signup profile write.

## Current Status

- [x] **Complete** — July 2026

## Files Involved

- `src/services/authService.ts`

## Step-by-Step Implementation Checklist

- [x] Use `requireFirestoreDb()` before signup `setDoc`
- [x] Improve generic auth error fallback for unknown `auth/` codes
- [x] Run `npm run build`

## Acceptance Criteria

- [x] Signup creates Auth + Firestore profile when configured
- [x] Clear error when Firestore unavailable
- [x] `npm run build` passes

## Manual Testing Checklist

- [ ] Signup with valid Firebase config works

## Notes

None.
