const prisma = require('../config/prisma');
const QRCode = require('qrcode');

const createBooking = async (req, res, next) => {
  try {
    const { showId, seatIds, paymentMethod } = req.body;
    if (!showId || !seatIds || !seatIds.length) {
      return res.status(400).json({ message: 'showId and seatIds are required' });
    }

    // Check seat availability
    const seats = await prisma.seat.findMany({
      where: { id: { in: seatIds.map(Number) }, showId: parseInt(showId) },
    });
    const unavailable = seats.filter(s => s.status !== 'available');
    if (unavailable.length > 0) {
      return res.status(409).json({ message: 'Some seats are already booked', seats: unavailable.map(s => `${s.row}${s.number}`) });
    }

    const show = await prisma.show.findUnique({ where: { id: parseInt(showId) } });
    const totalAmount = show.price * seatIds.length;

    // Create booking and update seats atomically
    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.create({
        data: {
          userId: req.user.id,
          showId: parseInt(showId),
          totalAmount,
          paymentMethod,
          status: 'confirmed',
          seats: { create: seatIds.map(id => ({ seatId: parseInt(id) })) },
        },
        include: { show: { include: { movie: true, theater: true } }, seats: { include: { seat: true } }, user: true },
      });
      await tx.seat.updateMany({
        where: { id: { in: seatIds.map(Number) } },
        data: { status: 'booked' },
      });
      return b;
    });

    // Generate QR
    const qrData = JSON.stringify({ bookingId: booking.id, movie: booking.show.movie.title, seats: seatIds });
    const qrCode = await QRCode.toDataURL(qrData);

    // Simulate notification
    console.log(`[EMAIL] Booking confirmation sent to ${booking.user.email} for booking #${booking.id}`);
    console.log(`[SMS] SMS sent to ${booking.user.phone || 'N/A'} for booking #${booking.id}`);

    res.status(201).json({ booking, qrCode });
  } catch (err) {
    next(err);
  }
};

const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: { show: { include: { movie: true, theater: true } }, seats: { include: { seat: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { show: { include: { movie: true, theater: true } }, seats: { include: { seat: true } }, user: true },
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const qrData = JSON.stringify({ bookingId: booking.id, movie: booking.show.movie.title });
    const qrCode = await QRCode.toDataURL(qrData);
    res.json({ booking, qrCode });
  } catch (err) {
    next(err);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { seats: true },
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({ where: { id: booking.id }, data: { status: 'cancelled' } });
      const seatIds = booking.seats.map(bs => bs.seatId);
      await tx.seat.updateMany({ where: { id: { in: seatIds } }, data: { status: 'available' } });
    });

    console.log(`[REFUND] Refund of ₹${booking.totalAmount} initiated for booking #${booking.id}`);
    res.json({ message: 'Booking cancelled and refund initiated' });
  } catch (err) {
    next(err);
  }
};

const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { show: { include: { movie: true, theater: true } }, user: true, seats: { include: { seat: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getUserBookings, getBookingById, cancelBooking, getAllBookings };
