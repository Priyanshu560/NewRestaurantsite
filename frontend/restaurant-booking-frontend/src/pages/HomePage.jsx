import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, MapPin, Star, Shield, Clock, ChefHat, ArrowRight, Sparkles } from 'lucide-react'
import { useApi } from '../hooks/useApi'
import { restaurantService } from '../services'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import { SkeletonCard } from '../components/common'

const FEATURES = [
  { icon: Search,   title: 'Discover',  desc: 'Browse curated restaurants by cuisine, city, or rating.' },
  { icon: Clock,    title: 'Book Instantly', desc: 'Real-time availability. Reserve in under 60 seconds.' },
  { icon: Shield,   title: 'Guaranteed', desc: 'Every booking confirmed instantly with email receipt.' },
  { icon: Star,     title: 'Reviewed',  desc: 'Verified diner reviews to help you choose with confidence.' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const { data: featured, loading } = useApi(
    () => restaurantService.search({ size: 6 }),
    [], true
  )

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/restaurants?name=${encodeURIComponent(query)}`)
  }

  const restaurants = featured?.content ?? []

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center justify-center px-4 py-20">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px]
                          rounded-full bg-brand-600/5 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-brand-800/10 blur-2xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-amber-800/8 blur-2xl" />
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(#dc6b1a 1px, transparent 1px), linear-gradient(90deg, #dc6b1a 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          bg-brand-500/10 border border-brand-500/20 text-brand-400
                          text-xs font-medium font-body mb-6 animate-fade-in">
            <Sparkles size={12} />
            The finest table booking experience
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-slate-50
                         leading-[1.05] tracking-tight mb-6 animate-fade-up">
            Reserve your{' '}
            <span className="text-brand-400 italic">perfect</span>
            <br />table tonight
          </h1>

          <p className="text-lg md:text-xl text-slate-400 font-body font-light
                        max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up"
             style={{ animationDelay: '0.1s' }}>
            From candlelit bistros to rooftop terraces — discover, book and dine
            with complete confidence.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch}
            className="flex gap-2 max-w-lg mx-auto animate-fade-up"
            style={{ animationDelay: '0.2s' }}>
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search restaurants, cuisines, cities…"
                className="input pl-10 h-12"
              />
            </div>
            <button type="submit" className="btn-primary h-12 px-6 shrink-0">
              Search
            </button>
          </form>

          {/* Quick filters */}
          <div className="flex flex-wrap justify-center gap-2 mt-4 animate-fade-up"
               style={{ animationDelay: '0.3s' }}>
            {['Italian', 'Japanese', 'Indian', 'French', 'Mexican'].map(c => (
              <button key={c} onClick={() => navigate(`/restaurants?cuisine=${c}`)}
                className="px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60
                           text-xs text-slate-400 hover:border-brand-600/50 hover:text-brand-400
                           transition-colors font-body">
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="py-16 px-4 border-y border-slate-800/60 bg-slate-900/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center group">
              <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center
                              mx-auto mb-3 group-hover:bg-brand-500/20 transition-colors">
                <Icon size={20} className="text-brand-400" />
              </div>
              <h3 className="font-display font-semibold text-slate-200 mb-1">{title}</h3>
              <p className="text-xs text-slate-500 font-body leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured restaurants ────────────────────────────────── */}
      <section className="section">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs text-brand-400 font-medium font-body uppercase tracking-wider mb-1">
              Handpicked
            </p>
            <h2 className="font-display text-3xl font-semibold text-slate-100">
              Featured Restaurants
            </h2>
          </div>
          <Link to="/restaurants"
            className="hidden md:flex items-center gap-1.5 text-sm text-slate-400
                       hover:text-brand-400 transition-colors font-body">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : restaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        ) : (
          <div className="text-center py-16">
            <ChefHat size={40} className="mx-auto text-slate-700 mb-3" />
            <p className="text-slate-500 font-body">No restaurants yet. Check back soon!</p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/restaurants" className="btn-secondary">
            Explore all restaurants <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── CTA banner ─────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800
                          overflow-hidden p-10 md:p-14 text-center">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 0%, transparent 50%)' }} />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3 relative">
              Own a restaurant?
            </h2>
            <p className="text-brand-100 font-body mb-6 max-w-md mx-auto relative">
              Join TableVine and start accepting online bookings today.
              Manage tables, track analytics, and grow your business.
            </p>
            <Link to="/register?role=owner"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl
                         bg-white text-brand-700 font-medium font-body
                         hover:bg-brand-50 transition-colors shadow-lg relative">
              List your restaurant <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
