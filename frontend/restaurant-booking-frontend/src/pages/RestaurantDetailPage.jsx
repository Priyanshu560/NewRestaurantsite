import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Clock, Phone, Mail, Star, ChefHat, ArrowLeft, Table2, Users } from 'lucide-react'
import { restaurantService, reviewService } from '../services'
import { useApi, usePaginatedApi } from '../hooks/useApi'
import { StarRating, Pagination, SkeletonCard } from '../components/common'
import { ReviewCard, ReviewForm } from '../components/restaurant/ReviewComponents'
import { useAuth } from '../context/AuthContext'

export default function RestaurantDetailPage() {
  const { id }  = useParams()
  const { isAuthenticated, isCustomer } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('about')

  const { data: restaurant, loading } = useApi(
    () => restaurantService.getById(id), [id]
  )

  const { data: reviews, loading: revLoading, currentPage,
          totalPages, nextPage, prevPage, fetch: refetchReviews } =
    usePaginatedApi(
      (params) => reviewService.getByRestaurant(id, params),
      { size: 5 }
    )

  if (loading) return (
    <div className="section-sm">
      <div className="skeleton h-72 rounded-2xl mb-6" />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="skeleton h-8 w-2/3" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
        </div>
      </div>
    </div>
  )

  if (!restaurant) return (
    <div className="section text-center">
      <p className="text-slate-400 font-body">Restaurant not found.</p>
      <Link to="/restaurants" className="btn-primary mt-4">Browse Restaurants</Link>
    </div>
  )

  const r = restaurant

  return (
    <div>
      {/* Hero image */}
      <div className="relative h-64 md:h-80 bg-slate-800 overflow-hidden">
        {r.imageUrl ? (
          <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat size={64} className="text-slate-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
        <Link to="/restaurants"
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg
                     bg-slate-950/60 text-slate-300 backdrop-blur-sm text-sm font-body
                     hover:bg-slate-950/80 transition-colors">
          <ArrowLeft size={14} /> Back
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="md:col-span-2">
            {/* Title row */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-xs text-brand-400 font-medium font-body">{r.cuisine}</span>
                <h1 className="font-display text-3xl font-bold text-slate-100 mt-0.5">{r.name}</h1>
                <div className="flex items-center gap-2 mt-1.5">
                  <StarRating rating={r.averageRating} size={14} />
                  <span className="text-sm text-slate-400 font-body">
                    {parseFloat(r.averageRating || 0).toFixed(1)}
                  </span>
                  <span className="text-slate-700">·</span>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin size={12} />
                    <span className="text-sm font-body">{r.city}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-1 mb-6 border-b border-slate-800">
              {['about', 'reviews'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-body capitalize transition-colors -mb-px
                              border-b-2 ${activeTab === tab
                                ? 'border-brand-500 text-brand-400'
                                : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'about' && (
              <div className="space-y-4 animate-fade-in">
                {r.description && (
                  <p className="text-slate-400 font-body leading-relaxed">{r.description}</p>
                )}

                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: Clock, label: `${r.openingTime} – ${r.closingTime}` },
                    { icon: MapPin, label: r.address },
                    r.phone && { icon: Phone, label: r.phone },
                    r.email && { icon: Mail, label: r.email },
                  ].filter(Boolean).map(({ icon: Icon, label }, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-slate-400">
                      <Icon size={15} className="text-brand-500 shrink-0" />
                      <span className="text-sm font-body">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Table2 size={15} className="text-brand-500" />
                  <span className="text-sm text-slate-400 font-body">
                    {r.totalTables} tables available
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="animate-fade-in space-y-6">
                {isAuthenticated && isCustomer && (
                  <ReviewForm
                    restaurantId={parseInt(id)}
                    onSuccess={() => refetchReviews({ page: 0 })}
                  />
                )}

                {revLoading ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="skeleton h-4 w-1/3" />
                        <div className="skeleton h-3 w-full" />
                      </div>
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-slate-500 font-body text-sm text-center py-8">
                    No reviews yet. Be the first to review!
                  </p>
                ) : (
                  <div className="space-y-5">
                    {reviews.map(rv => <ReviewCard key={rv.id} review={rv} />)}
                  </div>
                )}

                <Pagination currentPage={currentPage} totalPages={totalPages}
                  onNext={nextPage} onPrev={prevPage} />
              </div>
            )}
          </div>

          {/* Booking sidebar */}
          <div className="md:col-span-1">
            <div className="card p-5 sticky top-20">
              <h3 className="font-display font-semibold text-slate-100 text-lg mb-1">
                Reserve a Table
              </h3>
              <p className="text-sm text-slate-500 font-body mb-5">
                Instant confirmation · Free cancellation
              </p>

              {isAuthenticated ? (
                <Link
                  to={`/book/${id}`}
                  className="btn-primary w-full justify-center text-base py-3.5"
                >
                  <Users size={18} /> Book a Table
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link to={`/login`} state={{ from: { pathname: `/book/${id}` } }}
                    className="btn-primary w-full justify-center">
                    Sign in to Book
                  </Link>
                  <Link to="/register" className="btn-secondary w-full justify-center text-sm">
                    Create Free Account
                  </Link>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                {[
                  ['Opens',  `${r.openingTime} daily`],
                  ['Closes', `${r.closingTime} daily`],
                  ['Tables', `${r.totalTables} available`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm font-body">
                    <span className="text-slate-500">{k}</span>
                    <span className="text-slate-300">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
