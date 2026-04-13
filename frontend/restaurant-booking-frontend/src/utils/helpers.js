import { format, parseISO } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return '—'
  try { return format(typeof date === 'string' ? parseISO(date) : date, 'MMM d, yyyy') }
  catch { return date }
}

export const formatTime = (time) => {
  if (!time) return '—'
  try {
    const [h, m] = time.split(':')
    const d = new Date(); d.setHours(+h, +m)
    return format(d, 'h:mm a')
  } catch { return time }
}

export const formatDateTime = (dt) => {
  if (!dt) return '—'
  try { return format(typeof dt === 'string' ? parseISO(dt) : dt, 'MMM d, yyyy h:mm a') }
  catch { return dt }
}

export const statusClass = (status) => ({
  CONFIRMED: 'badge-confirmed',
  PENDING:   'badge-pending',
  CANCELLED: 'badge-cancelled',
  COMPLETED: 'badge-completed',
  NO_SHOW:   'badge-no_show',
}[status] ?? 'badge-pending')

export const stars = (rating, max = 5) =>
  Array.from({ length: max }, (_, i) => i < Math.round(rating))

export const truncate = (str, len = 120) =>
  str?.length > len ? str.slice(0, len) + '…' : str

export const classNames = (...args) => args.filter(Boolean).join(' ')

export const timeSlots = () => {
  const slots = []
  for (let h = 10; h < 23; h++) {
    slots.push(`${String(h).padStart(2,'0')}:00`)
    slots.push(`${String(h).padStart(2,'0')}:30`)
  }
  return slots
}
