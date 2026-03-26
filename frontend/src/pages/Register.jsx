import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/Loader'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true)
    try { await register(form.name, form.email, form.password, form.phone); navigate('/') }
    catch (err) { setError(err.response?.data?.message || 'Registration failed.') }
    finally { setLoading(false) }
  }

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3
  const sColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500']
  const sLabel = ['', 'Weak', 'Fair', 'Strong']
  const sText = ['', 'text-red-500', 'text-amber-500', 'text-emerald-600']

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-8 hero-bg">
      <div className="w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white text-lg shadow-md shadow-rose-200">🎬</div>
            <span className="font-display text-2xl text-stone-900 font-bold">Cine<span className="text-rose-600">Book</span></span>
          </Link>
          <h1 className="font-display text-4xl text-stone-900 font-bold mb-1">Create Account</h1>
          <p className="text-stone-400 text-sm">Join thousands of movie lovers</p>
        </div>

        <div className="card p-7 shadow-md space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input type="text" value={form.name} onChange={set('name')} className="input" placeholder="John Doe" required />
          </div>
          <div>
            <label className="label">Email Address *</label>
            <input type="email" value={form.email} onChange={set('email')} className="input" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input type="tel" value={form.phone} onChange={set('phone')} className="input" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="label">Password *</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} className="input pr-12" placeholder="Min. 6 characters" required />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs px-1">{showPass ? 'Hide' : 'Show'}</button>
            </div>
            {form.password.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 flex gap-1">{[1,2,3].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? sColor[strength] : 'bg-stone-100'}`} />)}</div>
                <span className={`text-xs font-medium ${sText[strength]}`}>{sLabel[strength]}</span>
              </div>
            )}
          </div>
          {error && <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl"><span>⚠️</span>{error}</div>}
          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-3.5 text-base font-bold">
            {loading ? <span className="flex items-center justify-center gap-2"><Spinner size="sm" />Creating account…</span> : 'Create Account'}
          </button>
          <p className="text-stone-400 text-xs text-center">By signing up, you agree to our terms of service.</p>
        </div>

        <p className="text-center text-stone-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-rose-600 hover:text-rose-500 font-semibold">Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
