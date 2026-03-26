const prisma = require('../config/prisma');

const getAllTheaters = async (req, res, next) => {
  try {
    const { city } = req.query;
    const where = city ? { city } : {};
    const theaters = await prisma.theater.findMany({ where });
    res.json(theaters);
  } catch (err) {
    next(err);
  }
};

const getTheaterById = async (req, res, next) => {
  try {
    const theater = await prisma.theater.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!theater) return res.status(404).json({ message: 'Theater not found' });
    res.json(theater);
  } catch (err) {
    next(err);
  }
};

const createTheater = async (req, res, next) => {
  try {
    const { name, city, address } = req.body;
    const theater = await prisma.theater.create({ data: { name, city, address } });
    res.status(201).json(theater);
  } catch (err) {
    next(err);
  }
};

const updateTheater = async (req, res, next) => {
  try {
    const { name, city, address } = req.body;
    const theater = await prisma.theater.update({
      where: { id: parseInt(req.params.id) },
      data: { name, city, address },
    });
    res.json(theater);
  } catch (err) {
    next(err);
  }
};

const deleteTheater = async (req, res, next) => {
  try {
    await prisma.theater.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Theater deleted' });
  } catch (err) {
    next(err);
  }
};

const getCities = async (req, res, next) => {
  try {
    const theaters = await prisma.theater.findMany({ select: { city: true } });
    const cities = [...new Set(theaters.map(t => t.city))];
    res.json(cities);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllTheaters, getTheaterById, createTheater, updateTheater, deleteTheater, getCities };
