import { useState } from 'react'
import { formatDateTime } from '../../utils/helpers'
import { StarRating, StarPicker } from '../common'
import { reviewService } from '../../services'
import toast from 'react-hot-toast'

// ── Display a single review ───────────────────────────────────
export function ReviewCard({ review }) {
  return (
    <div className="border-b border-slate-800 pb-5 last:border-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-700/40 flex items-center justify-center
                          text-sm font-medium text-brand-300 font-body">
            {review.customerName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200 font-body">{review.customerName}</p>
            <p className="text-xs text-slate-600 font-body">{formatDateTime(review.createdAt)}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size={13} />
      </div>
      {review.comment && (
        <p className="text-sm text-slate-400 font-body leading-relaxed ml-10">
          {review.comment}
        </p>
      )}
    </div>
  )
}

// ── Form to submit a new review ───────────────────────────────
export function ReviewForm({ restaurantId, bookingId, onSuccess }) {
  const [rating,  setRating]  = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) { toast.error('Please select a star rating'); return }
    setLoading(true)
    try {
      await reviewService.create({ restaurantId, bookingId, rating, comment })
      toast.success('Review submitted!')
      setRating(0); setComment('')
      onSuccess?.()
    } catch {
      // error toast handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <h3 className="font-display font-semibold text-slate-100">Leave a Review</h3>

      <div>
        <label className="label">Your rating</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div>
        <label className="label">Comment (optional)</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Share your dining experience…"
          className="input resize-none"
        />
        <p className="text-xs text-slate-600 mt-1 text-right font-body">{comment.length}/1000</p>
      </div>

      <button type="submit" disabled={loading || rating === 0} className="btn-primary w-full justify-center">
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}
