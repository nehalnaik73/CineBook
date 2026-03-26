const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, getBookingById, cancelBooking, getAllBookings } = require('../controllers/bookingController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, createBooking);
router.get('/my', authMiddleware, getUserBookings);
router.get('/all', authMiddleware, adminMiddleware, getAllBookings);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id/cancel', authMiddleware, cancelBooking);

module.exports = router;
