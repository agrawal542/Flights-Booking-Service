const axios = require('axios');
const { sequelize } = require('../models');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const { BookingRepository } = require('../repositories');
const { Queue, ServerConfig } = require('../config');
const { Enums } = require('../utils/comman');
const { BOOKING_EXPIRED_TIME } = require('../utils/comman/enums');
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

const bookingRepository = new BookingRepository();

async function createBooking(data) {
    const transaction = await sequelize.transaction();
    try {
        const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
        const flightData = flight.data.data;

        if (data.noOfSeats > flightData.totalSeats) {
            throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
        }

        const totalBillingAmount = data.noOfSeats * flightData.price;
        const bookingPayload = { ...data, totalCost: totalBillingAmount };
        const booking = await bookingRepository.createBooking(bookingPayload, transaction);

        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`, {
            seats: data.noOfSeats
        });

        await transaction.commit();
        return booking;
    } catch (error) {
        console.log(error)
        await transaction.rollback();
        if (error.name === 'Error')
            throw error;
        throw new AppError('Something went wrong while creating booking', StatusCodes.BAD_REQUEST);
    }
}

async function makePayment(data) {
    const transaction = await sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(data.bookingId, transaction);
        if (bookingDetails.status == CANCELLED) {
            throw new AppError('The booking has been cancelled', StatusCodes.BAD_REQUEST);
        }

        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();

        if (currentTime - bookingTime > BOOKING_EXPIRED_TIME) {
            await cancelBooking(data.bookingId);
            throw new AppError('The booking has expired', StatusCodes.BAD_REQUEST);
        }

        if (bookingDetails.totalCost != data.totalCost) {
            throw new AppError('The amount of the payment doesnt match', StatusCodes.BAD_REQUEST);
        }
        if (bookingDetails.userId != data.userId) {
            throw new AppError('The user corresponding to the booking doesnt match', StatusCodes.BAD_REQUEST);
        }

        // we assume here that payment is successful
        await bookingRepository.update(data.bookingId, { status: BOOKED }, transaction);

        await transaction.commit();

        Queue.sendData({
            recepientEmail: data.email,
            subject: 'Flight booked',
            text: `Booking successfully done for the booking ${data.bookingId}`
        });
    } catch (error) {
        await transaction.rollback();
        if (error.name === 'Error')
            throw error;
        throw new AppError('Something went wrong while making payment', StatusCodes.BAD_REQUEST);
    }
}

async function cancelBooking(bookingId) {
    const transaction = await sequelize.transaction();
    try {

        const bookingDetails = await bookingRepository.get(bookingId, transaction);
        if (bookingDetails.status == CANCELLED) {
            await transaction.commit();
            return true;
        }

        await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`, {
            seats: bookingDetails.noOfSeats,
            dec: false
        });

        await bookingRepository.update(bookingId, { status: CANCELLED }, transaction);
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

async function cancelOldBookings() {
    try {
        const time = new Date(Date.now() - BOOKING_EXPIRED_TIME); // time 5 mins ago
        const response = await bookingRepository.cancelOldBookings(time);
        
        return response;
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    createBooking,
    makePayment,
    cancelOldBookings
}