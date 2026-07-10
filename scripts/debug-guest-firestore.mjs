/**
 * One-off debug: unauthenticated Firestore reads (guest simulation).
 * Run: node scripts/debug-guest-firestore.mjs
 */
import { loadEnv } from 'vite'
import { initializeApp } from 'firebase/app'
import { collection, getDocs, getFirestore } from 'firebase/firestore'

const env = loadEnv('development', process.cwd(), '')
console.log('VITE_LISTINGS_BACKEND=', env.VITE_LISTINGS_BACKEND ?? '(unset)')
console.log('VITE_FIREBASE_PROJECT_ID=', env.VITE_FIREBASE_PROJECT_ID ?? '(unset)')

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
})
const db = getFirestore(app)

async function tryCollection(name) {
  try {
    const snap = await getDocs(collection(db, name))
    console.log(`OK ${name}: ${snap.size} document(s)`)
    if (snap.size > 0) {
      const first = snap.docs[0]
      console.log(`  first id: ${first.id}`)
    }
    return { ok: true, size: snap.size }
  } catch (err) {
    console.error(`FAIL ${name}:`, err.code ?? err.name, err.message)
    return { ok: false, code: err.code ?? err.name, message: err.message }
  }
}

console.log('Testing unauthenticated Firestore reads...')
const listings = await tryCollection('listings')
const users = await tryCollection('users')
const reviews = await tryCollection('reviews')

if (!listings.ok || !users.ok || !reviews.ok) {
  process.exitCode = 1
}
