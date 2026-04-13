import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  UtensilsCrossed, Menu, X, Bell, ChevronDown,
  LayoutDashboard, BookOpen, Settings, LogOut, User
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'

export default function Navbar() {
  const { user, isAuthenticated, logout, isAdmin, isOwner } = useAuth()
  const { notifications } = useNotifications()
  const navigate = useNavigate()
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [profileOpen,  setProfileOpen]  = useState(false)
  const [notifOpen,    setNotifOpen]    = useState(false)
  const unread = notifications.length

  const handleLogout = () => {
    logout()
    navigate('/')
    setProfileOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center
                          group-hover:bg-brand-400 transition-colors">
            <UtensilsCrossed size={16} className="text-white" />
          </div>
          <span className="font-display font-semibold text-lg text-slate-100 tracking-tight">
            Table<span className="text-brand-400">Vine</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/restaurants" className={({ isActive }) =>
            `btn-ghost text-sm ${isActive ? 'text-brand-400' : ''}`}>
            Restaurants
          </NavLink>
          {isAuthenticated && (isAdmin || isOwner) && (
            <NavLink to="/dashboard" className={({ isActive }) =>
              `btn-ghost text-sm ${isActive ? 'text-brand-400' : ''}`}>
              Dashboard
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) =>
              `btn-ghost text-sm ${isActive ? 'text-brand-400' : ''}`}>
              Admin
            </NavLink>
          )}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => { setNotifOpen(o => !o); setProfileOpen(false) }}
                  className="btn-ghost p-2 relative"
                >
                  <Bell size={18} />
                  {unread > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 card shadow-2xl py-2 z-50 animate-fade-in">
                    <p className="px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider font-body">
                      Notifications
                    </p>
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-slate-500 text-center font-body">
                        No new notifications
                      </p>
                    ) : notifications.map((n, i) => (
                      <div key={i} className="px-4 py-2.5 hover:bg-slate-800 transition-colors">
                        <p className="text-sm text-slate-300 font-body">{n.type?.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-500 font-body mt-0.5">
                          {n.reference} · {n.date}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setProfileOpen(o => !o); setNotifOpen(false) }}
                  className="flex items-center gap-2 btn-ghost px-3 py-2"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-xs font-medium text-white">
                    {user?.fullName?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300 font-body max-w-[100px] truncate">
                    {user?.fullName}
                  </span>
                  <ChevronDown size={14} className="text-slate-500" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 card shadow-2xl py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-sm font-medium text-slate-200 font-body truncate">{user?.fullName}</p>
                      <p className="text-xs text-slate-500 font-body truncate">{user?.email}</p>
                    </div>
                    <Link to="/my-bookings" onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300
                                 hover:bg-slate-800 hover:text-slate-100 transition-colors font-body">
                      <BookOpen size={15} /> My Bookings
                    </Link>
                    {(isAdmin || isOwner) && (
                      <Link to="/dashboard" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300
                                   hover:bg-slate-800 hover:text-slate-100 transition-colors font-body">
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400
                                 hover:bg-slate-800 transition-colors font-body mt-1 border-t border-slate-800">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn-ghost text-sm">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm py-2">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden btn-ghost p-2"
          onClick={() => setMobileOpen(o => !o)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            <NavLink to="/restaurants" onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 font-body text-sm">
              Restaurants
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/my-bookings" onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 font-body text-sm">
                  My Bookings
                </NavLink>
                {(isAdmin || isOwner) && (
                  <NavLink to="/dashboard" onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 font-body text-sm">
                    Dashboard
                  </NavLink>
                )}
                <button onClick={handleLogout}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-red-400 hover:bg-slate-800 font-body text-sm">
                  Sign Out
                </button>
              </>
            )}
            {!isAuthenticated && (
              <div className="flex gap-2 pt-2">
                <Link to="/login"    onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 justify-center text-sm">Sign In</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 justify-center text-sm">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Close dropdowns on outside click */}
      {(profileOpen || notifOpen) && (
        <div className="fixed inset-0 z-30" onClick={() => { setProfileOpen(false); setNotifOpen(false) }} />
      )}
    </header>
  )
}
