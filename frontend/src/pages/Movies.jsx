import { useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import MovieCard from '../components/MovieCard'
import { SkeletonCard } from '../components/Loader'

export default function Movies() {
  const [movies, setMovies] = useState([])
  const [genres, setGenres] = useState([])
  const [languages, setLangs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [language, setLang] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotal] = useState(1)
  const [totalMovies, setTotalMovies] = useState(0)

  const fetchMovies = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 18 })
      if (search) params.set('search', search)
      if (genre) params.set('genre', genre)
      if (language) params.set('language', language)
      const { data } = await api.get(`/movies?${params}`)
      setMovies(data.movies); setTotal(data.totalPages); setTotalMovies(data.total)
    } finally { setLoading(false) }
  }, [page, search, genre, language])

  useEffect(() => { fetchMovies() }, [fetchMovies])
  useEffect(() => {
    api.get('/movies/genres').then(({ data }) => setGenres(data))
    api.get('/movies/languages').then(({ data }) => setLangs(data))
  }, [])

  const clearAll = () => { setGenre(''); setLang(''); setSearch(''); setPage(1) }
  const hasFilters = genre || language || search

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-rose-600 text-xs font-bold uppercase tracking-widest mb-1">Browse</p>
        <h1 className="font-display text-5xl text-stone-900 font-bold">Movies</h1>
        {!loading && <p className="text-stone-400 text-sm mt-1">{totalMovies} film{totalMovies !== 1 ? 's' : ''} available</p>}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search movies…" className="input pl-12 py-3.5" />
        {search && <button onClick={() => { setSearch(''); setPage(1) }} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
      </div>

      {/* Genre chips */}
      <div className="flex flex-wrap gap-2 mb-3">
        {genres.map(g => (
          <button key={g} onClick={() => { setGenre(g === genre ? '' : g); setPage(1) }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${genre === g ? 'bg-rose-600 text-white border-rose-600 shadow-sm shadow-rose-200' : 'bg-white text-stone-500 border-stone-200 hover:border-rose-300 hover:text-rose-600'}`}>
            {g}
          </button>
        ))}
      </div>

      {/* Language chips */}
      {languages.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <span className="text-stone-400 text-xs uppercase tracking-wider font-medium">Lang:</span>
          {languages.map(l => (
            <button key={l} onClick={() => { setLang(l === language ? '' : l); setPage(1) }}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${language === l ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-stone-400 border-stone-200 hover:border-blue-300 hover:text-blue-600'}`}>
              {l}
            </button>
          ))}
        </div>
      )}

      {hasFilters && (
        <div className="flex items-center gap-3 mb-6">
          <p className="text-stone-400 text-xs">{totalMovies} result{totalMovies !== 1 ? 's' : ''}</p>
          <button onClick={clearAll} className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-medium">✕ Clear all</button>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array(18).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-stone-700 text-xl font-semibold mb-2">No movies found</h3>
          <p className="text-stone-400 text-sm mb-6">Try adjusting your filters.</p>
          <button onClick={clearAll} className="btn-outline">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((m, i) => (
            <div key={m.id} className="fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
              <MovieCard movie={m} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn-outline py-2 px-5 text-sm disabled:opacity-40">← Prev</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i+1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${page===p ? 'bg-rose-600 text-white shadow-md shadow-rose-200' : 'bg-white text-stone-500 border border-stone-200 hover:border-rose-300'}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} className="btn-outline py-2 px-5 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  )
}
