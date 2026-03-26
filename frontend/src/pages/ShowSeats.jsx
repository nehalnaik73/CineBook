import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { PageLoader } from '../components/Loader'

export default function ShowSeats() {
  const { showId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { show, movie } = location.state || {}
  const [seats, setSeats] = useState([])
  const [selected, setSelected] = useState([])
  const [showData, setShowData] = useState(show || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get(`/seats/show/${showId}`), !showData ? api.get(`/shows/${showId}`) : Promise.resolve(null)])
      .then(([sr, shr]) => { setSeats(sr.data); if (shr) setShowData(shr.data); setLoading(false) }).catch(() => setLoading(false))
  }, [showId])

  const toggleSeat = (id) => setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  const total = selected.length * (showData?.price || 0)
  const selectedSeats = seats.filter(s => selected.includes(s.id))
  const rows = [...new Set(seats.map(s => s.row))].sort()
  const byRow = rows.reduce((acc, r) => { acc[r] = seats.filter(s => s.row === r).sort((a, b) => a.number - b.number); return acc }, {})

  const handleProceed = () => { if (!selected.length) return; navigate('/payment', { state: { showId: parseInt(showId), seatIds: selected, show: showData, movie, total } }) }

  if (loading) return <PageLoader />

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-400 hover:text-rose-600 text-sm mb-6 transition-colors group">
        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to showtimes
      </button>

      {showData && (
        <div className="card p-5 mb-6 shadow-sm flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl text-stone-900 font-bold leading-none">{movie?.title}</h1>
            <p className="text-stone-400 text-sm mt-1.5">{showData.theater?.name} · {showData.theater?.city}</p>
          </div>
          <div className="flex gap-4 items-center">
            {[['Date', showData.date], ['Time', showData.time]].map(([k, v]) => <div key={k} className="text-center"><p className="text-stone-400 text-xs">{k}</p><p className="text-stone-800 font-bold">{v}</p></div>)}
            <div className="w-px h-8 bg-stone-100" />
            <div className="text-center"><p className="text-stone-400 text-xs">Format</p><span className="badge bg-blue-100 text-blue-700">{showData.format}</span></div>
            <div className="w-px h-8 bg-stone-100" />
            <div className="text-center"><p className="text-stone-400 text-xs">Price</p><p className="text-emerald-600 font-bold">₹{showData.price}</p></div>
          </div>
        </div>
      )}

      {/* Screen */}
      <div className="text-center mb-8">
        <div className="relative inline-block w-full max-w-xs">
          <div className="h-2 bg-gradient-to-b from-stone-300 to-transparent rounded-t-full w-full" style={{ borderRadius: '50% 50% 0 0 / 8px 8px 0 0' }} />
          <p className="text-stone-400 text-xs mt-2 tracking-widest uppercase font-medium">Screen</p>
        </div>
      </div>

      {/* Seat grid */}
      <div className="card p-5 md:p-8 mb-6 shadow-sm overflow-x-auto">
        <div className="inline-block min-w-max mx-auto">
          {rows.map(row => (
            <div key={row} className="flex items-center gap-2 mb-2">
              <span className="text-stone-400 text-xs font-mono w-5 text-center flex-shrink-0">{row}</span>
              <div className="flex gap-1.5">
                {byRow[row].map(seat => (
                  <button key={seat.id} onClick={() => !seat.isBooked && toggleSeat(seat.id)}
                  className={`w-8 h-8 sm:w-9 sm:h-9 text-xs font-semibold flex items-center justify-center transition-all touch-manipulation ${seat.isBooked ? 'seat-booked cursor-not-allowed' : selected.includes(seat.id) ? 'seat-selected' : 'seat-available'}`}
                    disabled={seat.isBooked} title={`${seat.row}${seat.number}`}>
                    {seat.isBooked ? '✕' : seat.number}
                  </button>
                ))}
              </div>
              <span className="text-stone-400 text-xs font-mono w-5 text-center flex-shrink-0">{row}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 seat-available rounded flex items-center justify-center text-xs font-bold">1</div>
          <span className="text-xs text-stone-500 font-medium">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 seat-selected rounded flex items-center justify-center text-xs font-bold">1</div>
          <span className="text-xs text-stone-500 font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 seat-booked rounded flex items-center justify-center text-xs font-bold">✕</div>
          <span className="text-xs text-stone-500 font-medium">Booked</span>
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center justify-center gap-4 mb-6 text-xs">
        <span className="text-emerald-500 font-medium">{seats.filter(s => !s.isBooked).length} available</span>
        <span className="text-stone-300">·</span>
        <span className="text-stone-400">{seats.filter(s => s.isBooked).length} booked</span>
        <span className="text-stone-300">·</span>
        <span className="text-stone-400">{seats.length} total</span>
      </div>

      {/* Action bar */}
      <div className="card p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          {selected.length > 0 ? (
            <div><p className="text-stone-800 font-bold">{selected.length} seat{selected.length>1?'s':''} selected</p><p className="text-stone-400 text-sm mt-0.5">{selectedSeats.map(s=>`${s.row}${s.number}`).join(', ')}</p></div>
          ) : (
            <div><p className="text-stone-500 font-medium">No seats selected</p><p className="text-stone-400 text-sm">Click on available seats to select</p></div>
          )}
        </div>
        <div className="flex items-center gap-5">
          {selected.length > 0 && (
            <div className="text-right"><p className="text-stone-400 text-xs">Total</p><p className="text-stone-900 font-bold text-2xl">₹{total.toFixed(2)}</p></div>
          )}
          <div className="flex gap-2">
            {selected.length > 0 && <button onClick={() => setSelected([])} className="btn-outline text-sm py-2 px-4">Clear</button>}
            <button onClick={handleProceed} disabled={!selected.length} className="btn-primary py-3 px-6 text-base font-bold disabled:opacity-40">
              Proceed to Pay →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
