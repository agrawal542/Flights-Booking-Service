const express = require('express');
const { InfoController } = require('../../controllers');
const router = express.Router();
const bookingRoutes = require('./booking-routes')



router.use('/bookings', bookingRoutes);


router.get('/info',InfoController.info);




module.exports = router