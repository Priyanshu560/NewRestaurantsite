import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UtensilsCrossed, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const user = await login(form)
      toast.success(`Welcome back, ${user.fullName}!`)
      navigate(from, { replace: true })
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Invalid credentials' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20
                          items-center justify-center mb-4">
            <UtensilsCrossed size={22} className="text-brand-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-100">Welcome back</h1>
          <p className="text-sm text-slate-500 font-body mt-1">Sign in to your TableVine account</p>
        </div>

        <div className="card p-6 space-y-4">
          {errors.general && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <p className="text-sm text-red-400 font-body">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email" autoComplete="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="error-msg">{errors.email}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="error-msg">{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center h-11">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 font-body mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
            Create one
          </Link>
        </p>

        {/* Demo credentials */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <p className="text-xs text-slate-500 font-mono text-center mb-1">Demo admin</p>
          <p className="text-xs text-slate-400 font-mono text-center">
            admin@restaurant.com / Admin@1234
          </p>
        </div>
      </div>
    </div>
  )
}
