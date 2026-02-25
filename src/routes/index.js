const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const resourceRoutes = require('./resourceRoutes');
const reservationRoutes = require('./reservationRoutes');
const authRoutes = require('./authRoutes');
const roleRoutes = require('./roleRoutes');
const permissionRoutes = require('./permissionRoutes');

// Montar las rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/resources', resourceRoutes);
router.use('/reservations', reservationRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);

module.exports = router;
