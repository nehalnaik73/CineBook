const express = require('express');
const router = express.Router();
const { getAllMovies, getMovieById, createMovie, updateMovie, deleteMovie, getGenres, getLanguages } = require('../controllers/movieController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', getAllMovies);
router.get('/genres', getGenres);
router.get('/languages', getLanguages);
router.get('/:id', getMovieById);
router.post('/', authMiddleware, adminMiddleware, createMovie);
router.put('/:id', authMiddleware, adminMiddleware, updateMovie);
router.delete('/:id', authMiddleware, adminMiddleware, deleteMovie);

module.exports = router;
