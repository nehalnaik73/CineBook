import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { PageLoader } from '../components/Loader'
import { useAuth } from '../context/AuthContext'

const FORMAT_BADGE = { '2D':'bg-stone-100 text-stone-600 border-stone-200', '3D':'bg-blue-50 text-blue-600 border-blue-200', 'IMAX':'bg-purple-50 text-purple-600 border-purple-200', '4DX':'bg-amber-50 text-amber-600 border-amber-200' }

export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [movie, setMovie] = useState(null)
  const [shows, setShows] = useState([])
  const [cities, setCities] = useState([])
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    api.get(`/movies/${id}`).then(({ data }) => { setMovie(data); setLoading(false) }).catch(() => setLoading(false))
    api.get('/theaters/cities').then(({ data }) => setCities(data))
  }, [id])

  useEffect(() => {
    const params = new URLSearchParams({ movieId: id })
    if (city) params.set('city', city)
    api.get(`/shows?${params}`).then(({ data }) => { setShows(data); if (data.length > 0 && !selectedDate) setSelectedDate(data[0].date) })
  }, [id, city])

  if (loading) return <PageLoader />
  if (!movie) return <div className="text-center py-20 text-stone-400">Movie not found. <Link to="/movies" className="text-rose-600">Go back</Link></div>

  const dates = [...new Set(shows.map(s => s.date))].sort()
  const showsForDate = shows.filter(s => s.date === selectedDate)
  const grouped = showsForDate.reduce((acc, show) => { const key = show.theater.name; if (!acc[key]) acc[key] = { theater: show.theater, shows: [] }; acc[key].shows.push(show); return acc }, {})

  const handleBook = (show) => {
    if (!user) return navigate('/login', { state: { from: { pathname: `/movies/${id}` } } })
    navigate(`/shows/${show.id}/seats`, { state: { show, movie } })
  }

  const today = new Date().toISOString().split('T')[0]
  const formatDate = (d) => { if (d === today) return 'Today'; const dt = new Date(d + 'T00:00:00'); return dt.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) }
  const ratingColor = { 'U': 'bg-green-100 text-green-700', 'UA': 'bg-amber-100 text-amber-700', 'A': 'bg-red-100 text-red-600' }

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-b from-stone-100 to-white border-b border-stone-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <Link to="/movies" className="inline-flex items-center gap-2 text-stone-400 hover:text-rose-600 text-sm mb-8 transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            All Movies
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-36 md:w-52 flex-shrink-0">
              <div className="rounded-2xl overflow-hidden shadow-lg aspect-[2/3] bg-stone-200">
                {movie.poster ? <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge bg-rose-100 text-rose-700 border border-rose-200">{movie.genre}</span>
                <span className="badge bg-stone-100 text-stone-600 border border-stone-200">{movie.language}</span>
                <span className={`badge border ${ratingColor[movie.rating] || 'bg-stone-100 text-stone-600 border-stone-200'}`}>{movie.rating}</span>
                {movie.duration && <span className="badge bg-stone-100 text-stone-500 border border-stone-100">⏱ {movie.duration} min</span>}
              </div>
              <h1 className="font-display text-5xl md:text-6xl text-stone-900 font-bold mb-4 leading-tight">{movie.title}</h1>
              <p className="text-stone-500 leading-relaxed max-w-2xl text-sm md:text-base">{movie.description}</p>
              {movie.releaseDate && <p className="text-stone-400 text-xs mt-4">📅 Released: {new Date(movie.releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <h2 className="font-display text-4xl text-stone-900 font-bold">Showtimes</h2>
          <select value={city} onChange={e => setCity(e.target.value)} className="input w-44 py-2 text-sm">
            <option value="">All Cities</option>
            {cities.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {dates.length === 0 ? (
          <div className="card py-20 text-center shadow-sm"><div className="text-5xl mb-4">📅</div><p className="text-stone-400">No shows available{city ? ` in ${city}` : ''}.</p></div>
        ) : (
          <div>
            {/* Date tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {dates.map(d => (
                <button key={d} onClick={() => setSelectedDate(d)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${selectedDate===d ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-200' : 'bg-white text-stone-500 border-stone-200 hover:border-rose-300 hover:text-rose-600'}`}>
                  {formatDate(d)}
                </button>
              ))}
            </div>

            {Object.entries(grouped).length === 0 ? (
              <div className="card py-12 text-center shadow-sm"><p className="text-stone-400 text-sm">No shows on this date.</p></div>
            ) : (
              <div className="space-y-4">
                {Object.entries(grouped).map(([name, { theater, shows: ts }]) => (
                  <div key={name} className="card p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-stone-800 font-bold">{theater.name}</p>
                        <p className="text-stone-400 text-xs mt-0.5">{theater.city} · {theater.address}</p>
                      </div>
                      <span className="badge bg-blue-100 text-blue-700 text-xs">{theater.city}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {ts.map(show => (
                        <button key={show.id} onClick={() => handleBook(show)}
                          className={`flex flex-col items-center border rounded-xl px-5 py-3 transition-all group hover:border-rose-400 hover:bg-rose-50 hover:shadow-sm ${FORMAT_BADGE[show.format] || FORMAT_BADGE['2D']}`}>
                          <span className="font-bold text-sm group-hover:text-rose-700 transition-colors">{show.time}</span>
                          <span className={`text-xs mt-0.5 font-medium`}>{show.format}</span>
                          <span className="text-xs mt-1 text-stone-400 group-hover:text-rose-500 font-medium">₹{show.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
