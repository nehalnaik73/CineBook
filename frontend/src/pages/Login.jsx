import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/Loader'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const [email, setEmail] = useState('')
  const [password, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally { setLoading(false) }
  }

  const fillDemo = (type) => {
    if (type === 'admin') { setEmail('admin@cinebook.com'); setPass('admin123') }
    else { setEmail('john@example.com'); setPass('user123') }
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 hero-bg">
      <div className="w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white text-lg shadow-md shadow-rose-200">🎬</div>
            <span className="font-display text-2xl text-stone-900 font-bold">Cine<span className="text-rose-600">Book</span></span>
          </Link>
          <h1 className="font-display text-4xl text-stone-900 font-bold mb-1">Welcome Back</h1>
          <p className="text-stone-400 text-sm">Sign in to continue booking tickets</p>
        </div>

        {/* Demo shortcuts */}
        <div className="flex gap-2 mb-5">
          <button onClick={() => fillDemo('user')} className="flex-1 text-xs py-2.5 px-3 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-700 hover:border-stone-300 transition-all shadow-sm">
            👤 Demo User
          </button>
          <button onClick={() => fillDemo('admin')} className="flex-1 text-xs py-2.5 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-all">
            ⚙️ Demo Admin
          </button>
        </div>

        <div className="card p-7 shadow-md space-y-5">
          <div>
            <label className="label">Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPass(e.target.value)} className="input pr-12" placeholder="••••••••" required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs px-1">
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              <span>⚠️</span> {error}
            </div>
          )}
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-3.5 text-base font-bold">
            {loading ? <span className="flex items-center justify-center gap-2"><Spinner size="sm" /> Signing in…</span> : 'Sign In'}
          </button>
        </div>

        <p className="text-center text-stone-400 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-rose-600 hover:text-rose-500 font-semibold">Create one free →</Link>
        </p>
      </div>
    </div>
  )
}
