import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { Spinner } from '../components/Loader'

const METHODS = [
  { id: 'card',   label: 'Card', icon: '💳', sublabel: 'Credit / Debit' },
  { id: 'upi',    label: 'UPI',  icon: '📱', sublabel: 'Any UPI app' },
  { id: 'wallet', label: 'Wallet', icon: '👛', sublabel: 'CineWallet' },
]

export default function Payment() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showId, seatIds, show, movie, total } = location.state || {}

  const [method, setMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cardNum, setCardNum] = useState('')
  const [expiry, setExpiry]   = useState('')
  const [cvv, setCvv]         = useState('')
  const [name, setName]       = useState('')
  const [upiId, setUpiId]     = useState('')
  const [step, setStep] = useState(1) // 1=form, 2=processing, 3=done

  if (!showId || !seatIds) {
    return (
      <div className="text-center py-24 px-4">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-white text-xl font-semibold mb-2">No booking data found</h2>
        <p className="text-neutral-500 text-sm mb-6">Please start from the movie page.</p>
        <button onClick={() => navigate('/movies')} className="btn-primary">Browse Movies</button>
      </div>
    )
  }

  const formatCard = (v) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)
  const formatExpiry = (v) => { let d = v.replace(/\D/g, ''); if (d.length >= 3) d = d.slice(0,2)+'/'+d.slice(2,4); return d }

  const validate = () => {
    if (method === 'card') {
      if (cardNum.replace(/\s/g,'').length < 16) return 'Enter a valid 16-digit card number.'
      if (expiry.length < 5) return 'Enter a valid expiry date.'
      if (cvv.length < 3) return 'Enter a valid CVV.'
      if (!name.trim()) return 'Enter the cardholder name.'
    }
    if (method === 'upi' && !upiId.includes('@')) return 'Enter a valid UPI ID (e.g. name@upi).'
    if (method === 'wallet' && total > 2000) return 'Insufficient wallet balance.'
    return null
  }

  const handlePay = async () => {
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setError('')
    setLoading(true)
    setStep(2)
    await new Promise(r => setTimeout(r, 2000))
    try {
      const { data } = await api.post('/bookings', { showId, seatIds, paymentMethod: method })
      navigate(`/confirmation/${data.booking.id}`, { state: { booking: data.booking, qrCode: data.qrCode } })
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.')
      setLoading(false)
      setStep(1)
    }
  }

  if (step === 2) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center fade-in">
          <div className="w-20 h-20 rounded-full border-4 border-white/5 border-t-red-500 animate-spin mx-auto mb-6" />
          <h2 className="text-white text-xl font-semibold mb-2">Processing Payment</h2>
          <p className="text-neutral-500 text-sm">Please don't close this page…</p>
          <div className="mt-6 max-w-xs mx-auto h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="progress-bar h-full w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const convenienceFee = Math.round(total * 0.02)
  const grandTotal = total + convenienceFee

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-neutral-500 hover:text-white text-sm mb-8 transition-colors group">
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to seats
      </button>

      <div className="mb-8">
        <p className="text-red-500 text-xs font-semibold uppercase tracking-widest mb-1">Checkout</p>
        <h1 className="font-display text-5xl text-white tracking-wide">PAYMENT</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Main payment form */}
        <div className="lg:col-span-3 space-y-5">
          {/* Method selector */}
          <div className="card p-5">
            <p className="text-neutral-400 text-xs uppercase tracking-wider mb-4">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map(m => (
                <button key={m.id} onClick={() => { setMethod(m.id); setError('') }}
                  className={`p-3.5 rounded-xl border text-center transition-all ${method === m.id ? 'border-red-500 bg-red-600/10' : 'border-white/8 bg-white/3 hover:border-white/15'}`}>
                  <div className="text-2xl mb-1">{m.icon}</div>
                  <p className="text-white text-xs font-semibold">{m.label}</p>
                  <p className="text-neutral-600 text-xs">{m.sublabel}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Card form */}
          {method === 'card' && (
            <div className="card p-5 space-y-4 fade-in">
              <p className="text-neutral-400 text-xs uppercase tracking-wider">Card Details</p>
              <div>
                <label className="label">Card Number</label>
                <input className="input font-mono tracking-wider" placeholder="0000 0000 0000 0000"
                  value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))} maxLength={19} />
              </div>
              <div>
                <label className="label">Cardholder Name</label>
                <input className="input" placeholder="As printed on card" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Expiry</label>
                  <input className="input" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} maxLength={5} />
                </div>
                <div>
                  <label className="label">CVV</label>
                  <input className="input" placeholder="•••" type="password" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,''))} maxLength={4} />
                </div>
              </div>
            </div>
          )}

          {/* UPI form */}
          {method === 'upi' && (
            <div className="card p-5 fade-in">
              <p className="text-neutral-400 text-xs uppercase tracking-wider mb-4">UPI Details</p>
              <label className="label">UPI ID</label>
              <input className="input" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
              <p className="text-neutral-600 text-xs mt-2">e.g. mobile@gpay, yourname@paytm</p>
            </div>
          )}

          {/* Wallet */}
          {method === 'wallet' && (
            <div className="card p-5 fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">CineWallet Balance</p>
                  <p className="text-white text-2xl font-bold">₹2,000.00</p>
                </div>
                <span className="text-3xl">👛</span>
              </div>
              {total > 2000 && (
                <div className="mt-4 flex items-center gap-2 bg-red-950/40 border border-red-800/40 text-red-400 text-sm px-4 py-3 rounded-xl">
                  <span>⚠</span> Insufficient balance. Please use a different method.
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2.5 bg-red-950/60 border border-red-800/50 text-red-300 text-sm px-4 py-3 rounded-xl">
              <span className="mt-0.5">⚠</span> {error}
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="card p-5 sticky top-20">
            <p className="text-neutral-400 text-xs uppercase tracking-wider mb-4">Order Summary</p>

            {movie?.poster && (
              <div className="flex gap-3 mb-5 pb-4 border-b border-white/5">
                <img src={movie.poster} alt="" className="w-14 h-20 rounded-xl object-cover flex-shrink-0" onError={e => e.target.style.display='none'} />
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">{movie?.title}</p>
                  <p className="text-neutral-500 text-xs mt-1">{show?.format}</p>
                </div>
              </div>
            )}

            <div className="space-y-2.5 text-sm">
              {[
                ['Theater', show?.theater?.name],
                ['Date', show?.date],
                ['Time', show?.time],
                ['Seats', `${seatIds?.length} seat${seatIds?.length !== 1 ? 's' : ''}`],
              ].map(([k, v]) => v && (
                <div key={k} className="flex justify-between">
                  <span className="text-neutral-500">{k}</span>
                  <span className="text-neutral-300 text-right max-w-[55%] truncate">{v}</span>
                </div>
              ))}
              <div className="border-t border-white/5 pt-2.5 flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span className="text-neutral-300">₹{total?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Convenience fee</span>
                <span className="text-neutral-300">₹{convenienceFee}</span>
              </div>
              <div className="border-t border-white/5 pt-2.5 flex justify-between font-semibold">
                <span className="text-white text-base">Total</span>
                <span className="text-red-400 text-lg">₹{grandTotal?.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={handlePay} disabled={loading || (method === 'wallet' && total > 2000)}
              className="btn-primary w-full py-3.5 text-base font-bold mt-5">
              {loading ? <span className="flex items-center justify-center gap-2"><Spinner size="sm" /> Processing…</span> : `Pay ₹${grandTotal?.toFixed(2)}`}
            </button>

            <p className="text-neutral-600 text-xs text-center mt-3 flex items-center justify-center gap-1">
              🔒 Secured · This is a demo app
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
