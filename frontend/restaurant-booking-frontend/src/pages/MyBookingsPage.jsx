import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { bookingService } from '../services'
import { usePaginatedApi } from '../hooks/useApi'
import BookingCard from '../components/booking/BookingCard'
import { EmptyState, Pagination } from '../components/common'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const STATUS_FILTERS = ['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED']

export default function MyBookingsPage() {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [cancelling,   setCancelling]   = useState(null)

  const { data, loading, currentPage, totalPages, nextPage, prevPage, fetch } =
    usePaginatedApi(
      (params) => bookingService.getMyBookings(params),
      { size: 8 }
    )

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(bookingId)
    try {
      await bookingService.cancel(bookingId)
      toast.success('Booking cancelled')
      fetch({ page: currentPage })
    } catch {
      // handled by interceptor
    } finally {
      setCancelling(null)
    }
  }

  const filtered = statusFilter === 'ALL'
    ? data
    : data.filter(b => b.status === statusFilter)

  return (
    <div className="section-sm max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-100 mb-1">My Bookings</h1>
        <p className="text-slate-500 font-body text-sm">Your reservation history</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-none">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-body whitespace-nowrap transition-all
                        ${statusFilter === s
                          ? 'bg-brand-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'}`}>
            {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-5 w-1/3 mb-3" />
              <div className="skeleton h-4 w-2/3 mb-2" />
              <div className="skeleton h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No bookings found"
          description={statusFilter === 'ALL'
            ? "You haven't made any reservations yet."
            : `No ${statusFilter.toLowerCase()} bookings.`}
          action={
            <Link to="/restaurants" className="btn-primary mt-2 text-sm">
              Browse Restaurants
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={cancelling === booking.id ? null : handleCancel}
            />
          ))}
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages}
        onNext={nextPage} onPrev={prevPage} />
    </div>
  )
}
