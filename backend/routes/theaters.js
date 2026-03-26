const express = require('express');
const router = express.Router();
const { getAllTheaters, getTheaterById, createTheater, updateTheater, deleteTheater, getCities } = require('../controllers/theaterController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', getAllTheaters);
router.get('/cities', getCities);
router.get('/:id', getTheaterById);
router.post('/', authMiddleware, adminMiddleware, createTheater);
router.put('/:id', authMiddleware, adminMiddleware, updateTheater);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTheater);

module.exports = router;
