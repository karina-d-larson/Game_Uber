/**
 * Browser smoke test for guest browsing + profile links.
 * Run: npx playwright install chromium && node scripts/browser-smoke.mjs
 */
import { chromium } from 'playwright'

const BASE = process.env.APP_URL ?? 'http://localhost:5173'

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  console.log('1. Guest home feed')
  await page.goto(BASE, { waitUntil: 'networkidle' })
  const urlAfterHome = page.url()
  console.log('   URL:', urlAfterHome)
  if (urlAfterHome.includes('/login')) {
    throw new Error('Guest was redirected to login on /')
  }

  const emptyState = page.getByText('No offers yet')
  const errorState = page.getByText('Could not load listings')
  const listingLink = page.locator('a[href^="/listings/"]').first()

  if (await errorState.isVisible().catch(() => false)) {
    throw new Error('Dashboard shows listing load error')
  }

  const hasListings = await listingLink.isVisible().catch(() => false)
  const hasEmpty = await emptyState.isVisible().catch(() => false)
  console.log('   Has listings:', hasListings)
  console.log('   Empty state:', hasEmpty)

  if (!hasListings && !hasEmpty) {
    throw new Error('Neither listings nor empty state found on home')
  }

  if (!hasListings) {
    console.log('   Skipping detail/profile checks — no listings in feed')
    await browser.close()
    return
  }

  const listingHref = await listingLink.getAttribute('href')
  console.log('2. Guest listing detail:', listingHref)
  await listingLink.click()
  await page.waitForURL(/\/listings\//)

  const ownerProfileLink = page.locator('a[href^="/users/"]').first()
  await ownerProfileLink.waitFor({ state: 'visible', timeout: 10000 })
  const profileHref = await ownerProfileLink.getAttribute('href')
  console.log('   Owner profile href:', profileHref)

  console.log('3. Public profile page')
  await ownerProfileLink.click()
  await page.waitForURL(/\/users\//)
  const profileBody = await page.locator('body').innerText()
  const notFound = profileBody.includes('User profile not found')
  console.log('   Profile not found:', notFound)
  if (notFound) {
    throw new Error('Public profile returned not-found for linked owner')
  }

  console.log('Console errors:', consoleErrors.length ? consoleErrors : '(none)')
  await browser.close()
  console.log('PASS: guest browse + profile link smoke test')
}

main().catch((err) => {
  console.error('FAIL:', err.message)
  process.exit(1)
})
