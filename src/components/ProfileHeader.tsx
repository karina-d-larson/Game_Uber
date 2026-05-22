import { MaterialIcon } from './MaterialIcon'

/**
 * FIREBASE TODO: accept user profile props from Firestore users/{uid}
 * instead of hardcoded @boardgame_guru / avatar URLs.
 */
export function ProfileHeader() {
  return (
    <section className="flex flex-col items-center gap-lg rounded-xl bg-surface-container-lowest p-lg custom-shadow md:flex-row md:items-start">
      <div className="relative">
        <img
          alt="Avatar"
          className="h-32 w-32 rounded-full border-4 border-surface-container-high object-cover md:h-40 md:w-40"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKHIZ20m5AdsPygH7mo9GAuD80aTL1xPNpdImx_PbFWb2frljMf0-fa9nge7jYqMfhFyaoBDh6ebxk3Gw4W7FyskHsCV8GEnP61EJoS7kCkTtOeZ5DoilGGfNxKrkO4uQYnWY68kDyGSEOszS1csnfhTtXjjNVAxzPydRi1ChhsLJL0i2_KYXFjiuG3wqA0yiAkjW2HFNlQk3HJ6pv_AobcvOdPxIVOlOEGe78QMDjrvw8r3MQ9XRbkv05WoJl0boYQlLJFe_Z-7g"
        />
        <div className="absolute right-2 bottom-2 flex items-center justify-center rounded-full border-2 border-surface-container-lowest bg-secondary p-1 text-on-secondary">
          <MaterialIcon name="verified" filled className="text-sm" />
        </div>
      </div>
      <div className="flex-1 space-y-sm text-center md:text-left">
        <div className="flex flex-col gap-xs md:flex-row md:items-center md:gap-md">
          <h2 className="font-headline-lg text-headline-lg">@boardgame_guru</h2>
          <span className="inline-flex items-center rounded-full bg-secondary-container/10 px-3 py-1 font-label-md text-label-md text-secondary-container">
            Marketplace Member
          </span>
        </div>
        <div className="flex items-center justify-center gap-xs md:justify-start">
          <div className="flex text-secondary">
            <MaterialIcon name="star" filled />
            <MaterialIcon name="star" filled />
            <MaterialIcon name="star" filled />
            <MaterialIcon name="star" filled />
            <MaterialIcon name="star_half" filled />
          </div>
          <span className="font-body-md text-body-md text-on-surface-variant">
            (4.8 rating)
          </span>
        </div>
        <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">
          Tabletop enthusiast for 10+ years. I specialize in heavy euros and strategic
          deck-builders. Happy to lend my collection to responsible gamers in the
          metropolitan area!
        </p>
        <div className="flex flex-wrap justify-center gap-md pt-sm md:justify-start">
          <button
            type="button"
            className="rounded-lg bg-primary px-lg py-2 font-label-md text-label-md text-on-primary active:scale-95 transition-transform"
          >
            Message
          </button>
          <button
            type="button"
            className="rounded-lg border border-outline-variant px-lg py-2 font-label-md text-label-md text-on-surface active:scale-95 transition-transform hover:bg-surface-container-low"
          >
            Follow
          </button>
        </div>
      </div>
    </section>
  )
}
