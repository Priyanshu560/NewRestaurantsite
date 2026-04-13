import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts'
import { Users, UtensilsCrossed, TrendingUp, CheckCircle, XCircle,
         BarChart2, UserCheck, UserX } from 'lucide-react'
import { adminService } from '../services'
import { useApi, usePaginatedApi } from '../hooks/useApi'
import { EmptyState, Pagination, StatusBadge } from '../components/common'
import { formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const { data: stats, loading: statsLoading } = useApi(
    () => adminService.getDashboard(), []
  )

  return (
    <div className="section-sm">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-100">Admin Panel</h1>
        <p className="text-slate-500 font-body text-sm mt-0.5">System-wide analytics and management</p>
      </div>

      {/* Top-level KPI cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings',    value: stats.totalBookings,     icon: TrendingUp  },
            { label: 'Confirmed',         value: stats.confirmedBookings, icon: CheckCircle },
            { label: 'Total Users',       value: stats.totalUsers,        icon: Users       },
            { label: 'Restaurants',       value: stats.totalRestaurants,  icon: UtensilsCrossed },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={16} className="text-brand-500" />
                <span className="text-xs text-slate-500 font-body">{label}</span>
              </div>
              <p className="font-display text-3xl font-bold text-slate-100">{value ?? '–'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800 mb-6">
        {['overview', 'users', 'restaurants'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-body capitalize -mb-px border-b-2 transition-colors
                        ${activeTab === tab
                          ? 'border-brand-500 text-brand-400'
                          : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab stats={stats} loading={statsLoading} />}
      {activeTab === 'users'    && <UsersTab />}
      {activeTab === 'restaurants' && <RestaurantsTab />}
    </div>
  )
}

// ── Overview: charts ──────────────────────────────────────────
function OverviewTab({ stats, loading }) {
  if (loading || !stats) return (
    <div className="grid md:grid-cols-2 gap-6">
      {[1,2].map(i => <div key={i} className="card p-6 skeleton h-64" />)}
    </div>
  )

  const dailyData = Object.entries(stats.dailyBookingTrend || {})
    .slice(-14)
    .map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      bookings: count
    }))

  const topData = Object.entries(stats.topRestaurantsByBookings || {})
    .map(([name, count]) => ({ name: name.length > 16 ? name.slice(0, 16) + '…' : name, bookings: count }))

  const statusData = [
    { name: 'Confirmed',  value: stats.confirmedBookings  },
    { name: 'Cancelled',  value: stats.cancelledBookings  },
    { name: 'Completed',  value: stats.completedBookings  },
    { name: 'Pending',    value: stats.pendingBookings    },
  ]

  const tooltipStyle = {
    contentStyle: { background: '#1e293b', border: '1px solid #334155', borderRadius: '8px',
                    fontFamily: '"DM Sans",sans-serif', fontSize: '12px' },
    labelStyle: { color: '#94a3b8' }, itemStyle: { color: '#e2e8f0' }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Daily trend */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-slate-200 mb-4">
          Daily Bookings — Last 14 Days
        </h3>
        {dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="bookings" stroke="#dc6b1a" strokeWidth={2}
                    dot={{ fill: '#dc6b1a', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-600 font-body text-sm text-center py-12">No data yet</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top restaurants */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-slate-200 mb-4">Top Restaurants</h3>
          {topData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topData} layout="vertical">
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                <YAxis type="category" dataKey="name" width={100}
                       tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="bookings" fill="#dc6b1a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-600 font-body text-sm text-center py-12">No data yet</p>
          )}
        </div>

        {/* Booking status breakdown */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-slate-200 mb-4">Booking Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" fill="#dc6b1a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

// ── Users tab ─────────────────────────────────────────────────
function UsersTab() {
  const [toggling, setToggling] = useState(null)
  const { data: users, loading, currentPage, totalPages,
          nextPage, prevPage, fetch } =
    usePaginatedApi((params) => adminService.getUsers(params), { size: 15 })

  const toggle = async (userId) => {
    setToggling(userId)
    try {
      await adminService.toggleUserStatus(userId)
      toast.success('User status updated')
      fetch({ page: currentPage })
    } catch {} finally { setToggling(null) }
  }

  if (loading) return <div className="space-y-3">{Array(5).fill(0).map((_, i) =>
    <div key={i} className="skeleton h-16 rounded-xl" />)}</div>

  return (
    <div className="animate-fade-in space-y-3">
      {users.length === 0
        ? <EmptyState icon={Users} title="No users found" />
        : users.map(u => (
          <div key={u.id} className="card p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-700/30 flex items-center justify-center
                              text-sm font-medium text-brand-300 font-body shrink-0">
                {u.fullName?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200 font-body">{u.fullName}</p>
                <p className="text-xs text-slate-500 font-body">{u.email} ·{' '}
                  {u.roles?.map(r => r.replace('ROLE_', '')).join(', ')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`badge ${u.enabled ? 'badge-confirmed' : 'badge-cancelled'}`}>
                {u.enabled ? 'Active' : 'Disabled'}
              </span>
              <button
                onClick={() => toggle(u.id)}
                disabled={toggling === u.id}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-500 hover:text-slate-300
                           hover:bg-slate-700 transition-colors"
                title={u.enabled ? 'Disable' : 'Enable'}>
                {u.enabled ? <UserX size={14} /> : <UserCheck size={14} />}
              </button>
            </div>
          </div>
        ))
      }
      <Pagination currentPage={currentPage} totalPages={totalPages}
        onNext={nextPage} onPrev={prevPage} />
    </div>
  )
}

// ── Restaurants tab ───────────────────────────────────────────
function RestaurantsTab() {
  const { data: restaurants, loading, currentPage, totalPages,
          nextPage, prevPage } =
    usePaginatedApi((params) => adminService.getRestaurants(params), { size: 15 })

  if (loading) return <div className="space-y-3">{Array(5).fill(0).map((_, i) =>
    <div key={i} className="skeleton h-16 rounded-xl" />)}</div>

  return (
    <div className="animate-fade-in space-y-3">
      {restaurants.length === 0
        ? <EmptyState icon={UtensilsCrossed} title="No restaurants found" />
        : restaurants.map(r => (
          <div key={r.id} className="card p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-200 font-body">{r.name}</p>
              <p className="text-xs text-slate-500 font-body">
                {r.city} · {r.cuisine} · Owner: {r.ownerName}
              </p>
            </div>
            <span className={`badge shrink-0 ${r.active ? 'badge-confirmed' : 'badge-cancelled'}`}>
              {r.active ? 'Active' : 'Inactive'}
            </span>
          </div>
        ))
      }
      <Pagination currentPage={currentPage} totalPages={totalPages}
        onNext={nextPage} onPrev={prevPage} />
    </div>
  )
}
