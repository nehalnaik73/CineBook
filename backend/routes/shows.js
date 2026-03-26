const express = require('express');
const router = express.Router();
const { getShows, getShowById, createShow, updateShow, deleteShow } = require('../controllers/showController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', getShows);
router.get('/:id', getShowById);
router.post('/', authMiddleware, adminMiddleware, createShow);
router.put('/:id', authMiddleware, adminMiddleware, updateShow);
router.delete('/:id', authMiddleware, adminMiddleware, deleteShow);

module.exports = router;
