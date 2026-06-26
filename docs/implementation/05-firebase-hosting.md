# Firebase Hosting config

## Goal

Add repo config for Firebase Hosting SPA deploy (Dev 3 implements).

## Current Status

**Complete** — config files added. Actual deploy requires Firebase Console + CLI login.

## Files Involved

- `firebase.json`
- `.firebaserc` (placeholder)

## Step-by-Step Implementation Checklist

- [x] Add `firebase.json` with `public: dist`, SPA rewrite
- [x] Add `.firebaserc` with placeholder project id + comment
- [x] Document deploy command in file comments

## Acceptance Criteria

- `firebase deploy --only hosting` config valid after `npm run build`
- SPA routes rewrite to index.html

## Manual Testing Checklist

- [x] `npm run build` produces `dist/`
- [ ] (Manual) `firebase deploy` after Console project link

## Notes

Deploy: `npm run build && firebase deploy --only hosting` (replace project id in `.firebaserc` first).

**Stop condition:** Firebase Console configuration and CLI credentials required for live deploy.

## Build result

`npm run build` — **pass** (2026-06-18)
