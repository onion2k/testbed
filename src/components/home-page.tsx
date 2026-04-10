import { Link } from 'react-router-dom'
import { demoUsers } from '../lib/demo-config'

export function HomePage() {
  const featuredProducts = demoUsers.length > 0
    ? [
        {
          title: 'Wireless Headset',
          category: 'Audio',
          description: 'Noise-cancelling sound for focused sessions and cleaner demo calls.',
          accent: 'from-amber-100 to-orange-50',
        },
        {
          title: 'Smart Lamp',
          category: 'Home Office',
          description: 'Adaptive light profiles built for long workdays and late-night checkouts.',
          accent: 'from-sky-100 to-cyan-50',
        },
        {
          title: 'Mechanical Keyboard',
          category: 'Peripherals',
          description: 'Compact, tactile, and fast enough for power users and premium desks.',
          accent: 'from-stone-200 to-stone-50',
        },
      ]
    : []

  return (
    <div className="space-y-8">
      <section className="panel-accent panel-accent-amber overflow-hidden rounded-[1.5rem]">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="px-8 py-10 lg:px-10 lg:py-12">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">Spring Collection</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-slate-900 lg:text-6xl">
              Upgrade your workspace with gear that looks as good as it performs.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600">
              Discover practical audio, lighting, and desk accessories curated for modern setups. Fast checkout, VIP exclusives, and a clean shopping experience are all built in.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary rounded-full bg-slate-900 px-5 py-3 font-medium text-white">
                Shop now
              </Link>
              <Link to="/vip" className="rounded-full bg-stone-200 px-5 py-3 font-medium text-slate-700">
                Explore VIP picks
              </Link>
            </div>
          </div>

          <div className="grid gap-4 bg-stone-50 p-6 lg:p-8">
            {featuredProducts.map((product) => (
              <article
                key={product.title}
                className={`rounded-[1rem] bg-gradient-to-br ${product.accent} p-5 shadow-sm ring-1 ring-white/60`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{product.category}</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">{product.title}</h2>
                <p className="mt-2 text-sm text-slate-700">{product.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: 'Designed for everyday setups',
            description: 'Smart desk essentials, elevated peripherals, and clean home-office hardware.',
            accent: 'panel-accent panel-accent-sky',
          },
          {
            title: 'Premium member exclusives',
            description: 'VIP shoppers unlock private products and a curated premium area.',
            accent: 'panel-accent panel-accent-violet',
          },
          {
            title: 'Fast checkout experience',
            description: 'Build a basket, move through a multi-step checkout, and keep order history close at hand.',
            accent: 'panel-accent panel-accent-emerald',
          },
        ].map((card) => (
          <article key={card.title} className={`${card.accent} rounded-[1.25rem] p-6`}>
            <h2 className="text-2xl font-semibold">{card.title}</h2>
            <p className="mt-3 text-slate-600">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel-accent panel-accent-cyan rounded-[1.25rem] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Featured categories</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              ['Audio', 'Immersive sound and focus-first listening.'],
              ['Lighting', 'Desk lighting made for flexible workspaces.'],
              ['Peripherals', 'Compact, tactile gear for productive setups.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-[1rem] border border-stone-200 bg-stone-50 p-4">
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-accent panel-accent-rose rounded-[1.25rem] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Why shoppers love it</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-3">Clean product browsing with clear pricing and stock visibility.</li>
            <li className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-3">Multi-step checkout flow with persisted basket and order history.</li>
            <li className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-3">VIP-only collection for premium users looking for exclusive items.</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
