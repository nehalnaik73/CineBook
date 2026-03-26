const express = require('express');
const router = express.Router();
const { getSeatsByShow } = require('../controllers/seatController');

router.get('/show/:showId', getSeatsByShow);

module.exports = router;
