import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../components/shell/Page'
import { PageHeader } from '../components/shell/PageHeader'
import { ProfileHeader } from '../components/ProfileHeader'
import { MaterialIcon } from '../components/MaterialIcon'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../routes/paths'
import { getPreferences } from '../services/userService'
import { DEFAULT_USER_PREFERENCES } from '../types/user'

const STATS = [
  { value: '98%', label: 'Lender Score' },
  { value: '100%', label: 'Renter Score' },
  { value: '142', label: 'Review count' },
  { value: '256', label: 'Completed trades' },
]

const REVIEWS = [
  {
    name: 'Sarah J.',
    when: '2 days ago',
    stars: 5,
    text: 'Excellent lender! The copy of "Terraforming Mars" was in pristine condition, and communication was super smooth. Highly recommend renting from @boardgame_guru.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBLJakZkYtXv0KjKych2WBeFgyh_gY6Wlkuw8x0GNd2trvPvRn1ogS0RWHgvflH1rkNDcJtUY3z4XApQflK2vlKnvTd_LBU0REBU7rbKZtPcrFa6cJeB322ejYL5dOTfgjpran_AbvfitG4wZXFJnK_Esb1_z3jDQ-MLEqRq4Rkx46WZeYnMjHdt1B0MI6ggwztFGDt4TGwo4F9vSIZiyfpoonQ03lUARxJCjd2C9sGu98lu2KZ9kIU9ONrfyHJfWnZsGJvPQY7qi0',
  },
  {
    name: 'Marcus T.',
    when: '1 week ago',
    stars: 4,
    text: 'Great experience. He was very flexible with the meeting time and gave some great tips for learning the rules quickly.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBj_ZJtfaPB_QZhA4soiBogL7QyJswFa1fBcf-TkkS_iTJNNSCjdrIJszQCbUFRlz-IwLb9fUw2Fc2S1cVC9TUW28A40CyYGrUPQZ-ApAmwJBI4rkqVcYPFaWBcovh0hMxipB3pRWvukGH0nKCdQcFHtd-zg_RW4wTWRXkwFsYLl0qfoE-XbcuVsXq2ZD4ALGT2nIrWtqjfudm1bb74tT8CrSSlmyp7eVvcKyfXs9oE6dlI7GvwwKTxrjTMZfmLPgfgtAkyBmKFk6I',
  },
  {
    name: 'Elena R.',
    when: '2 weeks ago',
    stars: 5,
    text: 'Perfect rental. The game was organized and included high-quality expansions too. Definitely would borrow from him again.',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCMfKC8fhIr9rvIkC1WfYD_Cxzl4e5aKM0YwiKzNMXoN3t_ouzAu2AFlODvtoAQmSXVgNQR5fk7Chc_FRuhyfobn4kpa_Vql_cAPOCVdNZ52Cj2fU2wArnwbkwuBP8qnaaT-Tj45xou5JH9dojFV_7P_FUW1PjnMbpcG1TE8F6udKH4Pbn_UHrXw3Uo8y60NVHSKdt4i-jPd0unIG7qAz6SSQnNy3Kkzm1L_oB8HHQwdYIFkocbZM3md46Da80oYjwaAQBENYaDjIc',
  },
]

function StarRow({ count }: { count: number }) {
  return (
    <div className="flex text-tertiary-fixed-dim">
      {[1, 2, 3, 4, 5].map((star) => (
        <MaterialIcon
          key={star}
          name={star <= count ? 'star' : 'star_outline'}
          filled={star <= count}
          className="text-sm"
        />
      ))}
    </div>
  )
}

/**
 * Profile page — static mock content for now.
 *
 * FIREBASE TODO (teammate): load users/{uid} from Firestore in ProfileHeader
 *   - Use route param or AuthContext for which profile to show
 *   - Reviews subcollection or separate reviews query
 * See: docs/FIREBASE_INTEGRATION.md — Milestone 2
 */
export function ProfilePage() {
  const { user } = useAuth()
  const [showPhoto, setShowPhoto] = useState(DEFAULT_USER_PREFERENCES.showProfilePhoto)
  const [showFollowingList, setShowFollowingList] = useState(
    DEFAULT_USER_PREFERENCES.showFollowingList,
  )

  useEffect(() => {
    if (!user) return

    let cancelled = false
    void (async () => {
      try {
        const prefs = await getPreferences(user.id)
        if (!cancelled) {
          setShowPhoto(prefs.showProfilePhoto)
          setShowFollowingList(prefs.showFollowingList)
        }
      } catch {
        if (!cancelled) {
          setShowPhoto(DEFAULT_USER_PREFERENCES.showProfilePhoto)
          setShowFollowingList(DEFAULT_USER_PREFERENCES.showFollowingList)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  if (!user) return null

  return (
    <Page header={<PageHeader variant="profile" />} className="space-y-xl">
        <ProfileHeader user={user} showPhoto={showPhoto} />

        <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg custom-shadow">
          <h3 className="mb-md font-headline-md text-headline-md text-primary">Account</h3>
          <p className="mb-md font-body-md text-body-md text-on-surface-variant">
            Signed in as {user.email}
          </p>
          <div className="flex flex-wrap gap-md">
            <Link
              to={ROUTES.settings}
              className="inline-flex min-h-11 items-center rounded-lg bg-secondary px-lg py-3 font-label-md text-label-md text-on-secondary transition-colors hover:brightness-110"
            >
              Settings
            </Link>
            {showFollowingList && (
              <Link
                to={ROUTES.following}
                className="inline-flex min-h-11 items-center rounded-lg border border-outline-variant px-lg py-3 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
              >
                Following
              </Link>
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-md md:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center space-y-xs rounded-xl bg-surface-container-low p-md"
            >
              <span className="font-headline-lg text-headline-lg text-primary">
                {stat.value}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant">
                {stat.label}
              </span>
            </div>
          ))}
        </section>

        <section className="space-y-lg">
          <h3 className="font-headline-md text-headline-md text-primary">Reviews</h3>

          <div className="space-y-md">
            {REVIEWS.map((review) => (
              <div
                key={review.name}
                className="flex flex-col gap-lg rounded-xl bg-surface-container-lowest p-lg custom-shadow md:flex-row"
              >
                <div className="flex shrink-0 flex-col items-center md:items-start">
                  <img
                    alt="Reviewer"
                    className="mb-2 h-12 w-12 rounded-full object-cover"
                    src={review.avatar}
                  />
                  <span className="font-label-md text-label-md text-on-surface">
                    {review.name}
                  </span>
                </div>
                <div className="flex-1 space-y-xs">
                  <div className="flex items-center justify-between">
                    <StarRow count={review.stars} />
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      {review.when}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface">
                    {review.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
    </Page>
  )
}
