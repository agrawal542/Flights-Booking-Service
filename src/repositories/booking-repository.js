const CrudRepository = require("./crud-repository");
const { Booking } = require("../models")
const { Enums } = require('../utils/comman');
const { Op } = require("sequelize");
const { CANCELLED ,BOOKED} = Enums.BOOKING_STATUS;
class BookingRepository extends CrudRepository {
    constructor() {
        super(Booking)
    }

    async createBooking(data, transaction) {
        const response = await Booking.create(data, { transaction: transaction });
        return response;
    }

    async cancelOldBookings(timestamp) {
        const response = await Booking.update({ status: CANCELLED }, {
            where: {
                [Op.and]: [
                    {
                        createdAt: {
                            [Op.lt]: timestamp
                        }
                    },
                    {
                        status: {
                            [Op.ne]: BOOKED
                        }
                    },
                    {
                        status: {
                            [Op.ne]: CANCELLED
                        }
                    }
                ]

            }
        });
        return response;
    }
}

module.exports = BookingRepository