export function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'
  return <svg className={`${s} animate-spin text-rose-500`} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="w-12 h-12 rounded-full border-3 border-stone-100 border-t-rose-500 animate-spin" style={{borderWidth:'3px'}} />
      <p className="text-stone-400 text-sm animate-pulse">Loading...</p>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden">
      <div className="shimmer aspect-[2/3] rounded-2xl mb-3" />
      <div className="shimmer h-3 rounded-full w-3/4 mb-2" />
      <div className="shimmer h-3 rounded-full w-1/2" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <tr className="border-b border-stone-100">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-4 py-4"><div className="shimmer h-3 rounded-full w-full" /></td>
      ))}
    </tr>
  )
}
