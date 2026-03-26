const prisma = require('../config/prisma');

const getShows = async (req, res, next) => {
  try {
    const { movieId, theaterId, date, city } = req.query;
    const where = {};
    if (movieId) where.movieId = parseInt(movieId);
    if (theaterId) where.theaterId = parseInt(theaterId);
    if (date) where.date = date;
    if (city) where.theater = { city };
    const shows = await prisma.show.findMany({
      where,
      include: { movie: true, theater: true },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });
    res.json(shows);
  } catch (err) {
    next(err);
  }
};

const getShowById = async (req, res, next) => {
  try {
    const show = await prisma.show.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { movie: true, theater: true, seats: true },
    });
    if (!show) return res.status(404).json({ message: 'Show not found' });
    res.json(show);
  } catch (err) {
    next(err);
  }
};

const createShow = async (req, res, next) => {
  try {
    const { movieId, theaterId, date, time, format, price, rows, seatsPerRow } = req.body;
    const show = await prisma.show.create({
      data: { movieId: parseInt(movieId), theaterId: parseInt(theaterId), date, time, format, price: parseFloat(price) },
    });
    // Generate seats
    const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, rows || 8);
    const seatData = [];
    for (const row of rowLabels) {
      for (let n = 1; n <= (seatsPerRow || 10); n++) {
        seatData.push({ showId: show.id, row, number: n, status: 'available' });
      }
    }
    await prisma.seat.createMany({ data: seatData });
    res.status(201).json(show);
  } catch (err) {
    next(err);
  }
};

const updateShow = async (req, res, next) => {
  try {
    const { date, time, format, price } = req.body;
    const show = await prisma.show.update({
      where: { id: parseInt(req.params.id) },
      data: { date, time, format, price: price ? parseFloat(price) : undefined },
    });
    res.json(show);
  } catch (err) {
    next(err);
  }
};

const deleteShow = async (req, res, next) => {
  try {
    await prisma.seat.deleteMany({ where: { showId: parseInt(req.params.id) } });
    await prisma.show.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Show deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getShows, getShowById, createShow, updateShow, deleteShow };
