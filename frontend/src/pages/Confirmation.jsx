import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import api from '../api/axios'
import { PageLoader } from '../components/Loader'

export default function Confirmation() {
  const { bookingId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(location.state?.booking || null)
  const [qrCode, setQrCode] = useState(location.state?.qrCode || '')
  const [loading, setLoading] = useState(!location.state?.booking)

  useEffect(() => {
    if (!booking) api.get(`/bookings/${bookingId}`).then(({ data }) => { setBooking(data.booking); setQrCode(data.qrCode); setLoading(false) }).catch(() => navigate('/profile'))
  }, [bookingId])

  if (loading) return <PageLoader />
  if (!booking) return null

  const { show, seats } = booking
  const seatLabels = seats?.map(bs => `${bs.seat?.row}${bs.seat?.number}`).join(', ') || '—'

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {/* Success */}
      <div className="text-center mb-10 fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-3xl text-emerald-600 mx-auto mb-5 shadow-lg shadow-emerald-100">✓</div>
        <h1 className="font-display text-5xl text-stone-900 font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-stone-400 text-sm">Your e-ticket is ready. Show QR code at the entrance.</p>
      </div>

      {/* Ticket */}
      <div className="fade-in mb-6" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-stone-100">
          {/* Top bar */}
          <div className="h-1.5 bg-gradient-to-r from-rose-500 to-rose-400" />

          <div className="p-6">
            {/* Movie info */}
            <div className="flex gap-4 items-start mb-5">
              {show?.movie?.poster && <img src={show.movie.poster} alt="" className="w-16 h-24 rounded-xl object-cover flex-shrink-0 shadow-md" onError={e => e.target.style.display='none'} />}
              <div className="flex-1">
                <div className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200 mb-2">✓ CONFIRMED</div>
                <h2 className="font-display text-2xl text-stone-900 font-bold leading-tight">{show?.movie?.title}</h2>
                <p className="text-stone-400 text-xs mt-1">{show?.movie?.genre} · {show?.movie?.language} · {show?.format}</p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-stone-100 pt-5">
              {[
                { label: 'Theater', primary: show?.theater?.name, secondary: show?.theater?.city },
                { label: 'Date & Time', primary: show?.date, secondary: show?.time },
                { label: 'Seats', primary: seatLabels, secondary: `${seats?.length} seat${seats?.length!==1?'s':''}` },
                { label: 'Amount Paid', primary: `₹${booking.totalAmount?.toFixed(2)}`, pClass: 'text-emerald-600 font-bold text-base', secondary: `Booking #${booking.id}` },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-stone-400 text-xs uppercase tracking-wider mb-1">{f.label}</p>
                  <p className={`font-semibold ${f.pClass || 'text-stone-800'}`}>{f.primary}</p>
                  <p className="text-stone-400 text-xs">{f.secondary}</p>
                </div>
              ))}
            </div>

            {/* Tear line */}
            <div className="relative my-6 mx-[-1.5rem]">
              <div className="border-t border-dashed border-stone-200" />
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stone-50 border border-stone-100" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-stone-50 border border-stone-100" />
            </div>

            {/* QR */}
            <div className="flex flex-col items-center pb-2 gap-3">
              <div className="bg-white p-3 rounded-2xl shadow-md border border-stone-100">
                <QRCodeSVG value={qrCode || JSON.stringify({ bookingId: booking.id, movie: show?.movie?.title, seats: seatLabels })} size={150} level="M" includeMargin={false} />
              </div>
              <p className="text-stone-400 text-xs">Scan at the theater entrance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3.5 rounded-xl text-sm mb-6 fade-in" style={{ animationDelay: '0.2s' }}>
        <span className="text-xl">📨</span>
        <div><p className="font-semibold">Confirmation sent</p><p className="text-emerald-500 text-xs">Email & SMS ticket sent (simulated)</p></div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 fade-in" style={{ animationDelay: '0.25s' }}>
        <Link to="/profile" className="btn-outline text-center py-3">👤 My Bookings</Link>
        <Link to="/movies" className="btn-primary text-center py-3">🎬 Book Another</Link>
      </div>
    </div>
  )
}
