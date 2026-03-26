import { Link } from 'react-router-dom'

export default function MovieCard({ movie }) {
  const ratingColor = { 'U': 'bg-green-100 text-green-700', 'UA': 'bg-amber-100 text-amber-700', 'A': 'bg-red-100 text-red-700' }

  return (
    <Link to={`/movies/${movie.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl mb-3 aspect-[2/3] bg-stone-100 shadow-sm">
        {movie.poster ? (
          <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl text-stone-300">🎬</div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <div className="bg-white text-rose-600 text-xs font-bold px-4 py-2 rounded-full transform scale-90 group-hover:scale-100 transition-transform shadow-lg">
            Book Now →
          </div>
        </div>

        {/* Rating badge */}
        <div className="absolute top-2 right-2">
          <span className={`badge text-xs ${ratingColor[movie.rating] || 'bg-stone-100 text-stone-600'}`}>{movie.rating}</span>
        </div>
      </div>

      <div>
        <h3 className="text-stone-800 text-sm font-semibold line-clamp-2 group-hover:text-rose-600 transition-colors leading-snug">{movie.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-stone-400 text-xs">{movie.genre}</span>
          {movie.duration && <><span className="text-stone-300">·</span><span className="text-stone-400 text-xs">{movie.duration}m</span></>}
        </div>
      </div>
    </Link>
  )
}
