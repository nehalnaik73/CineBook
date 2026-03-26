import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import MovieCard from '../components/MovieCard'
import { SkeletonCard } from '../components/Loader'

const FEATURES = [
  { icon: '🎟️', title: 'Instant Booking', desc: 'Reserve your seats in under 60 seconds.', color: 'bg-rose-50 text-rose-600' },
  { icon: '💺', title: 'Choose Your Seat', desc: 'Interactive maps let you pick the perfect spot.', color: 'bg-amber-50 text-amber-600' },
  { icon: '📱', title: 'Digital Tickets', desc: 'QR-coded e-tickets delivered instantly.', color: 'bg-blue-50 text-blue-600' },
  { icon: '🔒', title: 'Secure Payments', desc: 'Enterprise-grade payment protection.', color: 'bg-emerald-50 text-emerald-600' },
]

const GENRES = ['Action', 'Comedy', 'Drama', 'Thriller', 'Sci-Fi', 'Horror', 'Romance']

export default function Home() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [genre, setGenre] = useState('')

  useEffect(() => {
    const params = genre ? `/movies?limit=12&genre=${genre}` : '/movies?limit=12'
    api.get(params).then(({ data }) => { setMovies(data.movies); setLoading(false) })
      .catch(() => setLoading(false))
  }, [genre])

  return (
    <div>
      {/* Hero */}
      <section className="hero-bg relative overflow-hidden border-b border-stone-100">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-100/60 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-blue-100/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center fade-in">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-8 border border-rose-200">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
              Now Booking — New Releases
            </div>

            <h1 className="font-display text-6xl md:text-8xl text-stone-900 mb-6 leading-tight">
              Book Your <span className="gradient-text">Perfect</span> Movie Night
            </h1>

            <p className="text-stone-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover the latest blockbusters, choose your perfect seats, and enjoy a seamless booking experience from start to finish.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
              <Link to="/movies" className="btn-primary text-base px-10 py-3.5 font-bold shadow-lg shadow-rose-200">
                🎬 Browse Movies
              </Link>
              <Link to="/register" className="btn-outline text-base px-10 py-3.5">
                Join Free — It's Easy
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 md:gap-12">
              {[['50+', 'Movies'], ['20+', 'Theaters'], ['10K+', 'Happy Guests']].map(([num, label]) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-bold text-stone-900 font-display">{num}</div>
                  <div className="text-xs text-stone-400 mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating movie cards decoration */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-3 opacity-70">
          {['🎬','🍿','🎭'].map((e,i) => (
            <div key={i} className="w-12 h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-2xl border border-stone-100" style={{transform: `rotate(${(i-1)*5}deg)`}}>{e}</div>
          ))}
        </div>
      </section>

      {/* Now Showing */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-rose-600 text-xs font-bold uppercase tracking-widest mb-1">On Screen Now</p>
            <h2 className="font-display text-4xl text-stone-900 font-bold">Now Showing</h2>
          </div>
          <Link to="/movies" className="text-rose-600 hover:text-rose-500 text-sm font-semibold transition-colors self-start sm:self-auto">
            View All Movies →
          </Link>
        </div>

        {/* Genre filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button onClick={() => setGenre('')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${!genre ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-100' : 'bg-white text-stone-500 border-stone-200 hover:border-rose-300 hover:text-rose-600'}`}>
            All
          </button>
          {GENRES.map(g => (
            <button key={g} onClick={() => setGenre(g === genre ? '' : g)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${genre === g ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-100' : 'bg-white text-stone-500 border-stone-200 hover:border-rose-300 hover:text-rose-600'}`}>
              {g}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-stone-400">No movies for this genre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((m, i) => (
              <div key={m.id} className="fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                <MovieCard movie={m} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="section-bg border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <p className="text-rose-600 text-xs font-bold uppercase tracking-widest mb-2">Why CineBook?</p>
            <h2 className="font-display text-4xl text-stone-900 font-bold">Everything You Need</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="card p-6 hover:shadow-md hover:border-stone-200 transition-all duration-300 fade-in group" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>{f.icon}</div>
                <h3 className="text-stone-800 font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-br from-rose-600 to-rose-500 rounded-3xl p-10 text-center relative overflow-hidden shadow-xl shadow-rose-200">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff opacity=0.05%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
          <div className="relative">
            <h2 className="font-display text-4xl text-white font-bold mb-3">Ready to Watch?</h2>
            <p className="text-rose-100 mb-8 max-w-md mx-auto">Create a free account and start booking tickets for your favourite movies today.</p>
            <Link to="/register" className="inline-block bg-white text-rose-600 font-bold px-10 py-3.5 rounded-xl hover:bg-rose-50 transition-colors shadow-md">
              Create Free Account →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
