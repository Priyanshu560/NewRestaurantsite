import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Plus, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { restaurantService } from '../services'

const initialForm = {
  name: '',
  cuisine: '',
  address: '',
  city: '',
  description: '',
  phone: '',
  email: '',
  imageUrl: '',
  totalTables: 10,
  openingTime: '10:00',
  closingTime: '22:00',
}

export default function RestaurantCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        cuisine: form.cuisine.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        description: form.description.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        totalTables: Number(form.totalTables) || 0,
        openingTime: form.openingTime,
        closingTime: form.closingTime,
      }

      const { data } = await restaurantService.create(payload)
      const newId = data?.data?.id
      toast.success('Restaurant created')
      navigate(newId ? `/restaurants/${newId}` : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create restaurant')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="section-sm max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/dashboard" className="btn-ghost p-2">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="text-xs text-brand-400 font-body uppercase">Owner</p>
          <h1 className="font-display text-2xl font-bold text-slate-100">Add Restaurant</h1>
          <p className="text-slate-500 font-body text-sm">Create your restaurant profile to start taking bookings.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Name" required>
            <input className="input" value={form.name} onChange={e => update('name', e.target.value)} required />
          </Field>
          <Field label="Cuisine" required>
            <input className="input" value={form.cuisine} onChange={e => update('cuisine', e.target.value)} required />
          </Field>
          <Field label="City" required>
            <input className="input" value={form.city} onChange={e => update('city', e.target.value)} required />
          </Field>
          <Field label="Address" required>
            <input className="input" value={form.address} onChange={e => update('address', e.target.value)} required />
          </Field>
          <Field label="Opening Time (HH:mm)">
            <input className="input" value={form.openingTime} onChange={e => update('openingTime', e.target.value)} />
          </Field>
          <Field label="Closing Time (HH:mm)">
            <input className="input" value={form.closingTime} onChange={e => update('closingTime', e.target.value)} />
          </Field>
          <Field label="Total Tables" required>
            <input type="number" min="1" className="input" value={form.totalTables}
              onChange={e => update('totalTables', e.target.value)} required />
          </Field>
          <Field label="Image URL">
            <input className="input" value={form.imageUrl} onChange={e => update('imageUrl', e.target.value)} />
          </Field>
          <Field label="Phone">
            <input className="input" value={form.phone} onChange={e => update('phone', e.target.value)} />
          </Field>
          <Field label="Email">
            <input className="input" value={form.email} onChange={e => update('email', e.target.value)} />
          </Field>
        </div>

        <Field label="Description">
          <textarea className="input h-32" value={form.description}
            onChange={e => update('description', e.target.value)} />
        </Field>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            <Plus size={16} /> {saving ? 'Saving...' : 'Create Restaurant'}
          </button>
          <Link to="/dashboard" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <label className="space-y-1 block">
      <span className="label">{label}{required && ' *'}</span>
      {children}
    </label>
  )
}
