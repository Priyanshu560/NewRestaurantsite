import { Loader2, Star, ChevronLeft, ChevronRight, SearchX } from 'lucide-react'
import { stars } from '../../utils/helpers'

// ── Loading Spinner ───────────────────────────────────────────
export default function LoadingSpinner({ fullPage = false, size = 24 }) {
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={40} className="animate-spin text-brand-500" />
          <p className="text-slate-400 font-body text-sm">Loading…</p>
        </div>
      </div>
    )
  }
  return <Loader2 size={size} className="animate-spin text-brand-500" />
}

// ── Star Rating display ───────────────────────────────────────
export function StarRating({ rating = 0, max = 5, size = 14 }) {
  return (
    <span className="inline-flex gap-0.5">
      {stars(rating, max).map((filled, i) => (
        <Star
          key={i}
          size={size}
          className={filled ? 'star-filled fill-brand-400' : 'star-empty'}
        />
      ))}
    </span>
  )
}

// ── Interactive Star Picker ───────────────────────────────────
export function StarPicker({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={n <= value
              ? 'text-brand-400 fill-brand-400'
              : 'text-slate-600 hover:text-brand-600'}
          />
        </button>
      ))}
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────
export function Pagination({ currentPage, totalPages, onNext, onPrev }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        onClick={onPrev}
        disabled={currentPage === 0}
        className="btn-secondary px-3 py-2 disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-slate-400 font-body">
        Page <span className="text-slate-100 font-medium">{currentPage + 1}</span>
        {' '}of{' '}
        <span className="text-slate-100 font-medium">{totalPages}</span>
      </span>
      <button
        onClick={onNext}
        disabled={currentPage >= totalPages - 1}
        className="btn-secondary px-3 py-2 disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────
export function EmptyState({ icon: Icon = SearchX, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-500" />
      </div>
      <h3 className="text-lg font-display text-slate-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 font-body max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  )
}

// ── Skeleton card ─────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="card p-4 space-y-3">
      <div className="skeleton h-48 w-full" />
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-4 w-2/3" />
    </div>
  )
}

// ── Status Badge ──────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    CONFIRMED: 'badge-confirmed',
    PENDING:   'badge-pending',
    CANCELLED: 'badge-cancelled',
    COMPLETED: 'badge-completed',
    NO_SHOW:   'badge-no_show',
  }
  return (
    <span className={map[status] ?? 'badge-pending'}>
      {status?.replace('_', ' ')}
    </span>
  )
}
