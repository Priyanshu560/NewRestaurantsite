import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { addDays } from 'date-fns'
import {
  Calendar, Clock, Users, FileText, CreditCard,
  ArrowLeft, CheckCircle, Table2, Loader2
} from 'lucide-react'
import { restaurantService, bookingService } from '../services'
import { useApi } from '../hooks/useApi'
import { timeSlots, formatTime } from '../utils/helpers'
import toast from 'react-hot-toast'

const STEPS = ['Details', 'Table', 'Confirm']

export default function BookingPage() {
  const { restaurantId } = useParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const [form, setForm] = useState({
    bookingDate:     null,
    startTime:       '',
    endTime:         '',
    guestCount:      2,
    specialRequests: '',
    tableId:         null,
    depositAmount:   '',
  })
  const [availableTables, setAvailableTables]   = useState([])
  const [checkingAvail,   setCheckingAvail]     = useState(false)
  const [submitting,      setSubmitting]         = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  const { data: restaurant, loading: restLoading } = useApi(
    () => restaurantService.getById(restaurantId), [restaurantId]
  )

  const slots = timeSlots()
  const set = (field) => (val) => setForm(f => ({ ...f, [field]: val }))

  // Auto-set end time 2h after start
  useEffect(() => {
    if (!form.startTime) return
    const [h, m] = form.startTime.split(':').map(Number)
    const endH = (h + 2) % 24
    set('endTime')(`${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }, [form.startTime])

  const checkAvailability = async () => {
    if (!form.bookingDate || !form.startTime || !form.endTime) {
      toast.error('Please fill in date and time first')
      return
    }
    setCheckingAvail(true)
    try {
      const { data } = await bookingService.checkAvailable({
        restaurantId,
        date:      form.bookingDate.toISOString().split('T')[0],
        startTime: form.startTime,
        endTime:   form.endTime,
        guestCount: form.guestCount,
      })
      const tables = data?.data ?? data ?? []
      setAvailableTables(tables)
      if (tables.length === 0) {
        toast.error('No tables available for that time slot')
      } else {
        toast.success(`${tables.length} table(s) available!`)
        setStep(1)
      }
    } catch {
      toast.error('Could not check availability')
    } finally {
      setCheckingAvail(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        restaurantId: parseInt(restaurantId),
        bookingDate:  form.bookingDate.toISOString().split('T')[0],
        startTime:    form.startTime,
        endTime:      form.endTime,
        guestCount:   form.guestCount,
        specialRequests: form.specialRequests || undefined,
        tableId:      form.tableId || undefined,
        depositAmount: form.depositAmount ? parseFloat(form.depositAmount) : undefined,
      }
      const { data } = await bookingService.create(payload)
      setConfirmedBooking(data?.data ?? data)
      setStep(2)
      toast.success('Booking confirmed!')
    } catch {
      // interceptor handles error toast
    } finally {
      setSubmitting(false)
    }
  }

  if (restLoading) return (
    <div className="section-sm max-w-2xl mx-auto">
      <div className="skeleton h-12 w-full mb-4" />
      <div className="skeleton h-96 w-full rounded-2xl" />
    </div>
  )

  // ── Confirmation screen ───────────────────────────────────
  if (step === 2 && confirmedBooking) return (
    <div className="section-sm max-w-lg mx-auto text-center">
      <div className="card p-8 animate-fade-up">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center
                        mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-100 mb-1">Booking Confirmed!</h2>
        <p className="text-slate-500 font-body text-sm mb-6">
          A confirmation has been sent to your email.
        </p>

        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left space-y-2">
          {[
            ['Reference',   confirmedBooking.bookingReference],
            ['Restaurant',  confirmedBooking.restaurantName],
            ['Date',        confirmedBooking.bookingDate],
            ['Time',        `${formatTime(confirmedBooking.startTime)} – ${formatTime(confirmedBooking.endTime)}`],
            ['Guests',      `${confirmedBooking.guestCount} guests`],
            ['Table',       `#${confirmedBooking.tableNumber}`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm font-body">
              <span className="text-slate-500">{k}</span>
              <span className={k === 'Reference'
                ? 'font-mono text-brand-400 font-medium'
                : 'text-slate-200'}>{v}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Link to="/my-bookings" className="btn-secondary flex-1 justify-center text-sm">
            My Bookings
          </Link>
          <Link to="/restaurants" className="btn-primary flex-1 justify-center text-sm">
            Explore More
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="section-sm max-w-2xl mx-auto">
      {/* Back */}
      <Link to={`/restaurants/${restaurantId}`}
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300
                   text-sm font-body mb-6 transition-colors">
        <ArrowLeft size={14} /> {restaurant?.name}
      </Link>

      <h1 className="font-display text-2xl font-bold text-slate-100 mb-1">Reserve a Table</h1>
      <p className="text-slate-500 font-body text-sm mb-6">
        {restaurant?.name} · {restaurant?.city}
      </p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium font-body
                             transition-all ${i < step ? 'bg-brand-500 text-white'
                              : i === step ? 'bg-brand-500/20 text-brand-400 border border-brand-500/40'
                              : 'bg-slate-800 text-slate-500'}`}>
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className={`text-sm font-body ${i === step ? 'text-slate-200' : 'text-slate-600'}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-slate-800 mx-1" />}
          </div>
        ))}
      </div>

      {/* ── Step 0: Booking details ─────────────────────────── */}
      {step === 0 && (
        <div className="card p-6 space-y-5 animate-fade-in">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label flex items-center gap-1.5">
                <Calendar size={13} /> Date
              </label>
              <DatePicker
                selected={form.bookingDate}
                onChange={set('bookingDate')}
                minDate={addDays(new Date(), 1)}
                maxDate={addDays(new Date(), 60)}
                placeholderText="Select date"
                className="input"
                dateFormat="MMM d, yyyy"
              />
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <Users size={13} /> Guests
              </label>
              <select value={form.guestCount} onChange={e => set('guestCount')(parseInt(e.target.value))}
                className="input">
                {Array.from({ length: 20 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="label flex items-center gap-1.5">
                <Clock size={13} /> Start Time
              </label>
              <select value={form.startTime} onChange={e => set('startTime')(e.target.value)}
                className="input">
                <option value="">Select time</option>
                {slots.map(s => <option key={s} value={s}>{formatTime(s)}</option>)}
              </select>
            </div>
            <div>
              <label className="label flex items-center gap-1.5">
                <Clock size={13} /> End Time
              </label>
              <select value={form.endTime} onChange={e => set('endTime')(e.target.value)}
                className="input">
                <option value="">Select time</option>
                {slots.filter(s => s > form.startTime).map(s => (
                  <option key={s} value={s}>{formatTime(s)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-1.5">
              <FileText size={13} /> Special Requests
              <span className="text-slate-600">(optional)</span>
            </label>
            <textarea
              value={form.specialRequests}
              onChange={e => set('specialRequests')(e.target.value)}
              rows={2} maxLength={500}
              placeholder="Dietary requirements, high chair, anniversary…"
              className="input resize-none"
            />
          </div>

          <button onClick={checkAvailability} disabled={checkingAvail}
            className="btn-primary w-full justify-center h-11">
            {checkingAvail
              ? <><Loader2 size={16} className="animate-spin" /> Checking…</>
              : 'Check Availability'}
          </button>
        </div>
      )}

      {/* ── Step 1: Select table ────────────────────────────── */}
      {step === 1 && (
        <div className="animate-fade-in space-y-4">
          <p className="text-sm text-slate-400 font-body">
            Select a table for{' '}
            <span className="text-slate-200">{form.guestCount} guests</span> on{' '}
            <span className="text-slate-200">{form.bookingDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>{' '}
            at <span className="text-slate-200">{formatTime(form.startTime)}</span>
          </p>

          <div className="grid gap-3">
            {availableTables.map(table => (
              <button
                key={table.id}
                onClick={() => { set('tableId')(table.id); setStep(2 - 1 + 1) }}
                className={`card p-4 text-left transition-all hover:border-brand-600/60
                             ${form.tableId === table.id ? 'border-brand-500 bg-brand-500/5' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                      <Table2 size={18} className="text-brand-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200 font-body">Table #{table.tableNumber}</p>
                      <p className="text-xs text-slate-500 font-body">
                        {table.tableType} · Seats {table.capacity}
                      </p>
                    </div>
                  </div>
                  {form.tableId === table.id && (
                    <CheckCircle size={18} className="text-brand-400" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Optional deposit */}
          <div className="card p-4">
            <label className="label flex items-center gap-1.5">
              <CreditCard size={13} /> Deposit amount
              <span className="text-slate-600">(optional)</span>
            </label>
            <input
              type="number" min="0" step="0.01"
              value={form.depositAmount} onChange={e => set('depositAmount')(e.target.value)}
              placeholder="0.00" className="input"
            />
            <p className="text-xs text-slate-600 font-body mt-1.5">
              Mock payment — no real charge will be made
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="btn-secondary flex-1 justify-center">
              ← Back
            </button>
            <button onClick={handleSubmit} disabled={submitting || !form.tableId}
              className="btn-primary flex-1 justify-center">
              {submitting
                ? <><Loader2 size={16} className="animate-spin" /> Confirming…</>
                : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
