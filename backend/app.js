const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const theaterRoutes = require('./routes/theaters');
const showRoutes = require('./routes/shows');
const bookingRoutes = require('./routes/bookings');
const seatRoutes = require('./routes/seats');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/seats', seatRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;
