import { Link } from 'react-router-dom'
import { UtensilsCrossed, Github, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
                <UtensilsCrossed size={14} className="text-white" />
              </div>
              <span className="font-display font-semibold text-slate-100">
                Table<span className="text-brand-400">Vine</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 font-body max-w-xs leading-relaxed">
              Discover and reserve the finest dining experiences. From intimate bistros to grand restaurants.
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 font-body">Explore</p>
            <ul className="space-y-2">
              {[['Restaurants', '/restaurants'], ['How it works', '/'], ['For Owners', '/register']].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-slate-500 hover:text-brand-400 transition-colors font-body">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3 font-body">Account</p>
            <ul className="space-y-2">
              {[['Sign In', '/login'], ['Register', '/register'], ['My Bookings', '/my-bookings']].map(([label, to]) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-slate-500 hover:text-brand-400 transition-colors font-body">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600 font-body">© 2024 TableVine. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {[Github, Twitter, Instagram].map((Icon, i) => (
              <button key={i} className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center
                                        text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors">
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
