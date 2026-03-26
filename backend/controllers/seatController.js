const prisma = require('../config/prisma');

const getSeatsByShow = async (req, res, next) => {
  try {
    const showId = parseInt(req.params.showId);

    const seats = await prisma.seat.findMany({
      where: { showId },
      orderBy: [{ row: 'asc' }, { number: 'asc' }],
      include: {
        bookings: {
          include: {
            booking: {
              select: { status: true }
            }
          }
        }
      }
    });

    // Mark seat as booked if any CONFIRMED booking holds it
    const mapped = seats.map(seat => ({
      id:       seat.id,
      showId:   seat.showId,
      row:      seat.row,
      number:   seat.number,
      isBooked: seat.bookings.some(bs => bs.booking.status === 'confirmed'),
    }));

    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSeatsByShow };