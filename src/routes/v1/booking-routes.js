
const express = require("express");
const { BookingContrller } = require("../../controllers");

const router = express.Router();

router.post('/', BookingContrller.createBooking)


module.exports = router;