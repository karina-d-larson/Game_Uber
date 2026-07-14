/**
 * End-to-end browser verification for the three blocking bugs.
 * Run: node scripts/browser-verify-bugs.mjs
 */
import { chromium } from 'playwright'
import { loadEnv } from 'vite'
import { initializeApp } from 'firebase/app'
import { collection, getDocs, getFirestore } from 'firebase/firestore'

const BASE = process.env.APP_URL ?? 'http://localhost:5173'
const env = loadEnv('development', process.cwd(), '')

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
})
const db = getFirestore(app)

async function getListingOwnerId() {
  const snap = await getDocs(collection(db, 'listings'))
  const doc = snap.docs[0]
  if (!doc) return null
  const data = doc.data()
  return { id: doc.id, ownerId: String(data.ownerId ?? '') }
}

async function main() {
  const results = {
    bug1GuestListings: false,
    bug1GuestDetail: false,
    bug3OwnerNameLink: false,
    bug3PublicProfile: false,
    bug2ReviewSubmit: false,
  }

  const listingMeta = await getListingOwnerId()
  if (!listingMeta?.ownerId) {
    throw new Error('No listings in Firestore — cannot run full verification')
  }

  const stamp = Date.now()
  const email = `bugverify${stamp}@mailinator.com`
  const password = `TestPass${stamp}!`
  const username = `bugverify${stamp}`

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  console.log('BUG 1 — guest home feed at /')
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  if (page.url().includes('/login')) {
    throw new Error('Guest redirected to /login')
  }
  const listingCard = page.locator('article[role="link"]').first()
  await listingCard.waitFor({ state: 'visible', timeout: 15000 })
  results.bug1GuestListings = true
  console.log('  PASS: listings visible for guest')

  const listingHref = `/listings/${listingMeta.id}`
  console.log('BUG 1 — guest listing detail', listingHref)
  await page.goto(`${BASE}${listingHref}`, { waitUntil: 'domcontentloaded' })
  if (page.url().includes('/login')) {
    throw new Error('Guest redirected to login on listing detail')
  }
  await page.getByText('Loading listing…').waitFor({ state: 'hidden', timeout: 20000 }).catch(() => {})
  const loadError = page.getByText('Could not load listing')
  if (await loadError.isVisible().catch(() => false)) {
    const msg = await page.locator('body').innerText()
    throw new Error(`Listing detail error state: ${msg.slice(0, 300)}`)
  }
  const title = page.locator('h1.font-display-lg, h1').first()
  await title.waitFor({ state: 'visible', timeout: 20000 })
  results.bug1GuestDetail = true
  console.log('  PASS: listing detail loads for guest')

  console.log('BUG 3 — owner name link on listing detail')
  const ownerLink = page.locator(`a[href="/users/${listingMeta.ownerId}"]`).first()
  await ownerLink.waitFor({ state: 'visible', timeout: 10000 })
  results.bug3OwnerNameLink = true
  console.log('  PASS: owner name links to /users/:userId')

  await ownerLink.click()
  await page.waitForURL(/\/users\//)
  const profileText = await page.locator('body').innerText()
  if (profileText.includes('User profile not found')) {
    throw new Error('Public profile not found after clicking owner name')
  }
  results.bug3PublicProfile = true
  console.log('  PASS: public profile loads')

  console.log('BUG 2 — signed-in review submission')
  await page.goto(`${BASE}/signup`, { waitUntil: 'domcontentloaded' })
  await page.fill('#signup-email', email)
  await page.fill('#signup-password', password)
  await page.fill('#signup-username', username)
  await page.getByRole('button', { name: /sign up|create account/i }).click()
  await page.waitForURL((url) => !url.pathname.includes('/signup'), { timeout: 20000 })

  await page.goto(`${BASE}${listingHref}`, { waitUntil: 'domcontentloaded' })
  const reviewForm = page.getByRole('heading', { name: 'Leave a review' })
  await reviewForm.waitFor({ state: 'visible', timeout: 15000 })

  await page.getByRole('button', { name: '4 stars' }).click()
  await page.fill('#review-comment', `Automated verification review ${stamp}`)
  await page.getByRole('button', { name: 'Submit review' }).click()

  const success = page.getByText('Review submitted. Thank you!')
  const submitError = page.locator('[role="alert"]').filter({ hasText: /review|Firestore|permission/i })
  await Promise.race([
    success.waitFor({ state: 'visible', timeout: 15000 }),
    submitError.waitFor({ state: 'visible', timeout: 15000 }).then(async () => {
      const msg = await submitError.first().innerText()
      throw new Error(`Review submit failed: ${msg}`)
    }),
  ])
  results.bug2ReviewSubmit = true
  console.log('  PASS: review submitted successfully')

  await page.reload({ waitUntil: 'domcontentloaded' })
  const reviewText = page.getByText(`Automated verification review ${stamp}`)
  await reviewText.waitFor({ state: 'visible', timeout: 15000 })
  console.log('  PASS: review persists after refresh')

  console.log('Console errors during test:', consoleErrors.length ? consoleErrors : '(none)')
  await browser.close()

  console.log('\nVerification summary:', JSON.stringify(results, null, 2))
  const allPass = Object.values(results).every(Boolean)
  if (!allPass) throw new Error('Not all checks passed')
  console.log('ALL CHECKS PASSED')
}

main().catch((err) => {
  console.error('VERIFICATION FAILED:', err.message)
  process.exit(1)
})
