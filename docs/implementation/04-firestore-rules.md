# Firestore rules (users + following)

## Goal

Document and tighten users rules; ensure own-doc writes for `following`.

## Current Status

**Complete** — rules documented; existing own-doc policy covers `following` array.

## Files Involved

- `firestore.rules`

## Step-by-Step Implementation Checklist

- [x] Keep read for authed users
- [x] Keep create/update own doc
- [x] Add comments for `following` array on same doc
- [x] Optional: validate `following` is list on update (stretch — keep simple) — skipped, kept simple

## Acceptance Criteria

- User can update own `following` array
- User cannot write another user's doc

## Manual Testing Checklist

- [ ] Follow succeeds for signed-in user
- [ ] (Two accounts) B cannot write A's user doc

## Notes

Coordinate merge with Dev 1/2 rules sections when they add listings/messages rules.

## Build result

N/A (rules file only). App build — **pass**.
