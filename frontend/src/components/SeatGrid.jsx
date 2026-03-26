export default function SeatGrid({ seats, selected, onToggle }) {
  if (!seats || seats.length === 0) return <p className="text-neutral-500 text-center py-8">No seats available.</p>

  // Group by row
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = []
    acc[seat.row].push(seat)
    return acc
  }, {})

  return (
    <div className="space-y-2">
      {/* Screen indicator */}
      <div className="mb-6 text-center">
        <div className="mx-auto w-3/4 h-2 rounded-full bg-gradient-to-r from-transparent via-neutral-500 to-transparent mb-1" />
        <span className="text-neutral-500 text-xs uppercase tracking-widest">Screen</span>
      </div>

      {Object.entries(rows).map(([row, rowSeats]) => (
        <div key={row} className="flex items-center gap-2">
          <span className="text-neutral-600 text-xs w-4 text-center font-mono">{row}</span>
          <div className="flex gap-1.5 flex-wrap">
            {rowSeats.sort((a, b) => a.number - b.number).map((seat) => {
              const isSelected = selected.includes(seat.id)
              const isBooked = seat.status === 'booked'
              return (
                <button
                  key={seat.id}
                  disabled={isBooked}
                  onClick={() => !isBooked && onToggle(seat.id)}
                  title={`${seat.row}${seat.number} — ${isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}`}
                  className={`w-8 h-7 rounded text-xs font-mono font-bold transition-all duration-150
                    ${isBooked ? 'seat-booked' : isSelected ? 'seat-selected' : 'seat-available'}`}
                >
                  {seat.number}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex gap-5 justify-center pt-6 text-xs text-neutral-500">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-4 rounded seat-available" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-4 rounded seat-selected" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-4 rounded seat-booked" />
          <span>Booked</span>
        </div>
      </div>
    </div>
  )
}
