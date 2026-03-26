import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/'); setDropdownOpen(false) }
  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-rose-200 group-hover:bg-rose-500 transition-colors">🎬</div>
            <span className="font-display text-xl text-stone-900 font-bold">
              Cine<span className="text-rose-600">Book</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {[['/', 'Home'], ['/movies', 'Movies']].map(([path, label]) => (
              <Link key={path} to={path} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive(path) ? 'text-rose-600 bg-rose-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'}`}>{label}</Link>
            ))}
            {user?.role === 'admin' && (
              <Link to="/admin" className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname.startsWith('/admin') ? 'text-rose-600 bg-rose-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'}`}>Admin</Link>
            )}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-all text-sm">
                  <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-stone-700 font-medium max-w-24 truncate">{user.name}</span>
                  <svg className={`w-3.5 h-3.5 text-stone-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-stone-100 rounded-xl shadow-xl overflow-hidden z-50 fade-in">
                    <div className="px-4 py-3 bg-stone-50 border-b border-stone-100">
                      <p className="text-stone-800 text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-stone-400 text-xs truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                      <span>👤</span> My Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-stone-600 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                        <span>⚙️</span> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors border-t border-stone-100">
                      <span>↩</span> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 text-stone-500 hover:text-stone-800" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-stone-100 py-3 fade-in">
            <div className="flex flex-col gap-1">
              <Link to="/" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg">Home</Link>
              <Link to="/movies" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg">Movies</Link>
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg">Profile</Link>
                  {user.role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-4 py-2.5 text-sm text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg">Admin</Link>}
                  <button onClick={handleLogout} className="text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg">Sign Out</button>
                </>
              ) : (
                <div className="flex gap-2 px-4 pt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline text-sm flex-1 text-center">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm flex-1 text-center">Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
