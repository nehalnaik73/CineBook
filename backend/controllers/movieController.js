const prisma = require('../config/prisma');

const getAllMovies = async (req, res, next) => {
  try {
    const { genre, language, search, page = 1, limit = 12 } = req.query;
    const where = { isActive: true };
    if (genre) where.genre = genre;
    if (language) where.language = language;
    if (search) where.title = { contains: search };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [movies, total] = await Promise.all([
      prisma.movie.findMany({ where, skip, take: parseInt(limit), orderBy: { id: 'desc' } }),
      prisma.movie.count({ where }),
    ]);
    res.json({ movies, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
};

const getMovieById = async (req, res, next) => {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { shows: { include: { theater: true } } },
    });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    next(err);
  }
};

const createMovie = async (req, res, next) => {
  try {
    const { title, description, genre, language, duration, rating, poster, releaseDate } = req.body;
    const movie = await prisma.movie.create({
      data: { title, description, genre, language, duration: parseInt(duration), rating, poster, releaseDate },
    });
    res.status(201).json(movie);
  } catch (err) {
    next(err);
  }
};

const updateMovie = async (req, res, next) => {
  try {
    const { title, description, genre, language, duration, rating, poster, releaseDate, isActive } = req.body;
    const movie = await prisma.movie.update({
      where: { id: parseInt(req.params.id) },
      data: { title, description, genre, language, duration: duration ? parseInt(duration) : undefined, rating, poster, releaseDate, isActive },
    });
    res.json(movie);
  } catch (err) {
    next(err);
  }
};

const deleteMovie = async (req, res, next) => {
  try {
    await prisma.movie.update({ where: { id: parseInt(req.params.id) }, data: { isActive: false } });
    res.json({ message: 'Movie deleted' });
  } catch (err) {
    next(err);
  }
};

const getGenres = async (req, res, next) => {
  try {
    const movies = await prisma.movie.findMany({ where: { isActive: true }, select: { genre: true } });
    const genres = [...new Set(movies.map(m => m.genre))];
    res.json(genres);
  } catch (err) {
    next(err);
  }
};

const getLanguages = async (req, res, next) => {
  try {
    const movies = await prisma.movie.findMany({ where: { isActive: true }, select: { language: true } });
    const languages = [...new Set(movies.map(m => m.language))];
    res.json(languages);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie, getGenres, getLanguages };
