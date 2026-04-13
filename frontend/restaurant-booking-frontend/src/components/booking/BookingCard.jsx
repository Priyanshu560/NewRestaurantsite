import { Calendar, Clock, Users, Hash, X, CheckCircle } from 'lucide-react'
import { formatDate, formatTime } from '../../utils/helpers'
import { StatusBadge } from '../common'

export default function BookingCard({ booking, onCancel }) {
  const canCancel = ['CONFIRMED', 'PENDING'].includes(booking.status)

  return (
    <div className="card p-5 hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-mono text-xs text-brand-400 mb-1">{booking.bookingReference}</p>
          <h3 className="font-display font-semibold text-slate-100 text-lg leading-tight">
            {booking.restaurantName}
          </h3>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar size={14} className="text-brand-500 shrink-0" />
          <span className="text-sm font-body">{formatDate(booking.bookingDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Clock size={14} className="text-brand-500 shrink-0" />
          <span className="text-sm font-body">
            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Users size={14} className="text-brand-500 shrink-0" />
          <span className="text-sm font-body">{booking.guestCount} guests</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Hash size={14} className="text-brand-500 shrink-0" />
          <span className="text-sm font-body">Table #{booking.tableNumber}</span>
        </div>
      </div>

      {booking.specialRequests && (
        <p className="text-xs text-slate-500 font-body italic bg-slate-800/50 rounded-lg px-3 py-2 mb-4">
          "{booking.specialRequests}"
        </p>
      )}

      {/* Payment status */}
      {booking.depositAmount && (
        <div className="flex items-center justify-between text-xs font-body mb-4
                        bg-slate-800/50 rounded-lg px-3 py-2">
          <span className="text-slate-500">Deposit</span>
          <span className="text-slate-300 font-medium flex items-center gap-1">
            ${booking.depositAmount}
            {booking.paymentStatus === 'PAID' && (
              <CheckCircle size={12} className="text-emerald-400" />
            )}
            {booking.paymentStatus === 'REFUNDED' && (
              <span className="text-amber-400">(Refunded)</span>
            )}
          </span>
        </div>
      )}

      {/* Cancel action */}
      {canCancel && onCancel && (
        <button
          onClick={() => onCancel(booking.id)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg
                     text-sm font-body text-red-400 border border-red-900/40
                     hover:bg-red-900/20 transition-colors"
        >
          <X size={14} /> Cancel Booking
        </button>
      )}
    </div>
  )
}
