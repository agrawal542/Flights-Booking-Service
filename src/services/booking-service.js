const axios = require('axios');
const { sequelize } = require('../models');
const { FLIGHT_SERVICE } = require('../config/server-config');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const { BookingRepository } = require('../repositories');

const bookingRepository = new BookingRepository();

async function createBooking(data) {
    const transaction = await sequelize.transaction();
    try {
        const flight = await axios.get(`${FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
        const flightData = flight.data.data;

        if(data.noOfSeats > flightData.totalSeats) {
            throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
        }

        const totalBillingAmount = data.noOfSeats * flightData.price;
        const bookingPayload = {...data, totalCost: totalBillingAmount};
        const booking = await bookingRepository.createBooking(bookingPayload, transaction);
        await axios.patch(`${FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`, {
            seats: data.noOfSeats
        });

        await transaction.commit();
        return booking;
    } catch(error) {
        await transaction.rollback();
        if(error.name === 'Error')
            throw error ;
        throw new AppError('Something went wrong while creating booking', StatusCodes.BAD_REQUEST); 
    }  
}


module.exports = {
    createBooking
}