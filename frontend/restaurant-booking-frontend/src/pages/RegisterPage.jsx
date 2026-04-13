import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { UtensilsCrossed, Eye, EyeOff, Loader2, User, Building2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [params]     = useSearchParams()
  const defaultRole  = params.get('role') === 'owner' ? 'OWNER' : 'CUSTOMER'

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', role: defaultRole
  })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

  const validate = () => {
    const e = {}
    if (!form.fullName || form.fullName.trim().length < 2)
      e.fullName = 'Full name must be at least 2 characters'
    if (!form.email) e.email = 'Email is required'
    if (!form.password || form.password.length < 8)
      e.password = 'Password must be at least 8 characters'
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      e.password = 'Must contain uppercase, lowercase, and a number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await register({
        fullName: form.fullName,
        email:    form.email,
        password: form.password,
        phone:    form.phone || undefined,
        roles:    [form.role],
      })
      toast.success(`Account created! Welcome, ${user.fullName}!`)
      navigate(form.role === 'OWNER' ? '/dashboard' : '/')
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Registration failed' })
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20
                          items-center justify-center mb-4">
            <UtensilsCrossed size={22} className="text-brand-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Create account</h1>
          <p className="text-sm text-slate-500 font-body mt-1">Join TableVine today</p>
        </div>

        {/* Role toggle */}
        <div className="flex gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 mb-6">
          {[
            { value: 'CUSTOMER', label: 'Diner',        Icon: User },
            { value: 'OWNER',    label: 'Restaurant Owner', Icon: Building2 },
          ].map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm(f => ({ ...f, role: value }))}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                          text-sm font-body transition-all
                          ${form.role === value
                            ? 'bg-brand-500 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <div className="card p-6 space-y-4">
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-sm text-red-400 font-body">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input type="text" value={form.fullName} onChange={set('fullName')}
                className={`input ${errors.fullName ? 'input-error' : ''}`}
                placeholder="Jane Smith" autoComplete="name" />
              {errors.fullName && <p className="error-msg">{errors.fullName}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={set('email')}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="jane@example.com" autoComplete="email" />
              {errors.email && <p className="error-msg">{errors.email}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password} onChange={set('password')}
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="Min 8 chars, uppercase & number"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="error-msg">{errors.password}</p>}
            </div>

            <div>
              <label className="label">Phone <span className="text-slate-600">(optional)</span></label>
              <input type="tel" value={form.phone} onChange={set('phone')}
                className="input" placeholder="+1 234 567 8900" autoComplete="tel" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center h-11">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Creating account…</>
                : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 font-body mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
