import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { Spinner } from '../../components/Loader'

function StatCard({ label, value, icon, to, bg, text }) {
  return (
    <Link to={to} className="card p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center text-xl`}>{icon}</div>
        <svg className="w-4 h-4 text-stone-300 group-hover:text-rose-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </div>
      <p className="text-stone-400 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-3xl font-bold font-display ${text}`}>{value ?? '—'}</p>
    </Link>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/movies?limit=1'), api.get('/theaters'), api.get('/shows'), api.get('/bookings/all')])
      .then(([m, t, s, b]) => {
        const bookings = b.data
        const confirmed = bookings.filter(bk => bk.status === 'confirmed')
        setStats({ movies: m.data.total, theaters: t.data.length, shows: s.data.length, bookings: bookings.length, confirmed: confirmed.length, revenue: confirmed.reduce((sum, bk) => sum + bk.totalAmount, 0) })
        setRecentBookings(bookings.slice(0, 5))
        setLoading(false)
      }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-10">
        <p className="text-rose-600 text-xs font-bold uppercase tracking-widest mb-1">Admin Panel</p>
        <h1 className="font-display text-5xl text-stone-900 font-bold">Dashboard</h1>
        <p className="text-stone-400 text-sm mt-1">Overview of your cinema operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Movies"   value={stats.movies}   icon="🎬" to="/admin/movies"   bg="bg-rose-100"   text="text-stone-800" />
        <StatCard label="Theaters" value={stats.theaters} icon="🏛️" to="/admin/theaters" bg="bg-blue-100"   text="text-stone-800" />
        <StatCard label="Shows"    value={stats.shows}    icon="📅" to="/admin/shows"    bg="bg-purple-100" text="text-stone-800" />
        <StatCard label="Bookings" value={stats.bookings} icon="🎟️" to="/admin/bookings" bg="bg-amber-100"  text="text-stone-800" />
      </div>

      {/* Revenue */}
      <div className="bg-gradient-to-br from-rose-600 to-rose-500 rounded-2xl p-6 mb-8 shadow-lg shadow-rose-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-rose-100 text-xs uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="font-display text-5xl text-white font-bold">₹{stats.revenue.toLocaleString('en-IN')}</p>
            <p className="text-rose-200 text-xs mt-1">From {stats.confirmed} confirmed bookings</p>
          </div>
          <div className="text-5xl opacity-60">💰</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div>
          <h2 className="text-stone-700 font-semibold mb-4 text-sm uppercase tracking-wider">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            {[['🎬','Add New Movie','/admin/movies'],['🏛️','Add Theater','/admin/theaters'],['📅','Create Show','/admin/shows'],['🎟️','All Bookings','/admin/bookings']].map(([icon, label, to]) => (
              <Link key={label} to={to} className="card p-4 flex items-center gap-3 hover:border-rose-200 hover:shadow-md transition-all group">
                <div className="w-9 h-9 rounded-xl bg-stone-50 flex items-center justify-center text-base group-hover:bg-rose-50 transition-colors">{icon}</div>
                <span className="text-sm font-medium text-stone-600 group-hover:text-rose-600 transition-colors flex-1">{label}</span>
                <svg className="w-4 h-4 text-stone-300 group-hover:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-stone-700 font-semibold text-sm uppercase tracking-wider">Recent Bookings</h2>
            <Link to="/admin/bookings" className="text-rose-600 hover:text-rose-500 text-xs font-semibold">View All →</Link>
          </div>
          <div className="card overflow-hidden">
            {recentBookings.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-sm">No bookings yet</div>
            ) : (
              <div className="divide-y divide-stone-50">
                {recentBookings.map(b => (
                  <div key={b.id} className="px-5 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                    <div>
                      <p className="text-stone-800 text-sm font-semibold">{b.user?.name}</p>
                      <p className="text-stone-400 text-xs mt-0.5">{b.show?.movie?.title} · {b.seats?.length} seat{b.seats?.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-stone-800 font-semibold text-sm">₹{b.totalAmount}</p>
                      <span className={`badge text-xs ${b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
