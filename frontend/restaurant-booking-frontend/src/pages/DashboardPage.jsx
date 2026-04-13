import { useState } from 'react'
import {
  UtensilsCrossed, Plus, Calendar, TrendingUp,
  ChevronRight, Users, Clock, CheckCircle, XCircle
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { restaurantService, bookingService } from '../services'
import { useApi, usePaginatedApi } from '../hooks/useApi'
import { useAuth } from '../context/AuthContext'
import { StatusBadge, EmptyState, Pagination } from '../components/common'
import { formatDate, formatTime } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { isAdmin } = useAuth()
  const [activeTab,  setActiveTab]  = useState('bookings')
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)

  const { data: myRestaurants, loading: restLoading } = useApi(
    () => restaurantService.getMine(), []
  )
  const restaurants = myRestaurants ?? []

  const activeRestId = selectedRestaurant ?? restaurants[0]?.id

  const { data: bookings, loading: bookLoading, currentPage,
          totalPages, nextPage, prevPage, fetch: refetchBookings } =
    usePaginatedApi(
      (params) => activeRestId
        ? bookingService.getByRestaurant(activeRestId, params)
        : Promise.resolve({ data: { data: { content: [], totalPages: 0 } } }),
      { size: 10 },
    )

  const handleStatusChange = async (bookingId, status) => {
    try {
      await bookingService.updateStatus(bookingId, status)
      toast.success(`Booking marked as ${status.toLowerCase()}`)
      refetchBookings({ page: currentPage })
    } catch {}
  }

  return (
    <div className="section-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Owner Dashboard</h1>
          <p className="text-slate-500 font-body text-sm mt-0.5">Manage your restaurants and bookings</p>
        </div>
        <Link to="/restaurants/new" className="btn-primary text-sm">
          <Plus size={16} /> Add Restaurant
        </Link>
      </div>

      {/* Restaurant selector */}
      {restaurants.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {restaurants.map(r => (
            <button key={r.id}
              onClick={() => setSelectedRestaurant(r.id)}
              className={`px-4 py-2 rounded-xl text-sm font-body whitespace-nowrap transition-all
                          ${(activeRestId === r.id)
                            ? 'bg-brand-500 text-white'
                            : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'}`}>
              {r.name}
            </button>
          ))}
        </div>
      )}

      {restLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="card p-4 skeleton h-24" />
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No restaurants yet"
          description="Add your first restaurant to start accepting bookings."
          action={
            <Link to="/restaurants/new" className="btn-primary mt-3">
              <Plus size={16} /> Add Restaurant
            </Link>
          }
        />
      ) : (
        <>
          {/* Stats cards */}
          {activeRestId && <StatsRow restaurantId={activeRestId} bookings={bookings} />}

          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-800 mb-6">
            {['bookings', 'restaurants'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-body capitalize -mb-px border-b-2 transition-colors
                            ${activeTab === tab
                              ? 'border-brand-500 text-brand-400'
                              : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Bookings table */}
          {activeTab === 'bookings' && (
            <div className="animate-fade-in">
              {bookLoading ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="skeleton h-16 rounded-xl" />
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <EmptyState icon={Calendar} title="No bookings yet"
                  description="Bookings for this restaurant will appear here." />
              ) : (
                <div className="space-y-3">
                  {bookings.map(b => (
                    <div key={b.id} className="card p-4 flex flex-col sm:flex-row sm:items-center
                                               justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center
                                        justify-center shrink-0">
                          <Users size={16} className="text-brand-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-200 font-body text-sm">
                            {b.customerName}
                          </p>
                          <p className="text-xs text-slate-500 font-body">
                            {formatDate(b.bookingDate)} · {formatTime(b.startTime)} ·{' '}
                            {b.guestCount} guests · Table #{b.tableNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:shrink-0">
                        <StatusBadge status={b.status} />
                        {b.status === 'CONFIRMED' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStatusChange(b.id, 'COMPLETED')}
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400
                                         hover:bg-emerald-500/20 transition-colors"
                              title="Mark completed">
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => handleStatusChange(b.id, 'NO_SHOW')}
                              className="p-1.5 rounded-lg bg-slate-800 text-slate-500
                                         hover:bg-slate-700 transition-colors"
                              title="Mark no-show">
                              <XCircle size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Pagination currentPage={currentPage} totalPages={totalPages}
                onNext={nextPage} onPrev={prevPage} />
            </div>
          )}

          {/* Restaurants list */}
          {activeTab === 'restaurants' && (
            <div className="animate-fade-in space-y-4">
              {restaurants.map(r => (
                <div key={r.id} className="card p-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-slate-200 font-body">{r.name}</h3>
                    <p className="text-xs text-slate-500 font-body">
                      {r.city} · {r.cuisine} · {r.totalTables} tables
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`badge ${r.active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {r.active ? 'Active' : 'Inactive'}
                    </span>
                    <Link to={`/restaurants/${r.id}`}
                      className="btn-ghost p-2">
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatsRow({ restaurantId, bookings }) {
  const confirmed  = bookings.filter(b => b.status === 'CONFIRMED').length
  const today      = bookings.filter(b => b.bookingDate === new Date().toISOString().split('T')[0]).length
  const totalGuests = bookings.reduce((sum, b) => sum + (b.guestCount || 0), 0)

  const stats = [
    { icon: Calendar,    label: 'Total Bookings', value: bookings.length },
    { icon: CheckCircle, label: 'Confirmed',       value: confirmed },
    { icon: Clock,       label: 'Today',           value: today },
    { icon: Users,       label: 'Total Guests',    value: totalGuests },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map(({ icon: Icon, label, value }) => (
        <div key={label} className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon size={15} className="text-brand-500" />
            <span className="text-xs text-slate-500 font-body">{label}</span>
          </div>
          <p className="font-display text-2xl font-bold text-slate-100">{value}</p>
        </div>
      ))}
    </div>
  )
}
