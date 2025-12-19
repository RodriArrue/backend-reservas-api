const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const resourceRoutes = require('./resourceRoutes');
const reservationRoutes = require('./reservationRoutes');

// Montar las rutas
router.use('/users', userRoutes);
router.use('/resources', resourceRoutes);
router.use('/reservations', reservationRoutes);

module.exports = router;
