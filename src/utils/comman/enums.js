const SEAT_TYPE = {
    BUSINESS: 'business',
    ECONOMY: 'economy',
    PREMIUM_ECONOMY: 'premium-economy',
    FIRST_CLASS: 'first-class'
}

const BOOKING_STATUS = {
    INITIATED: 'initiated',
    PENDING: 'pending',
    BOOKED: 'booked',
    CANCELLED: 'cancelled'
}

const BOOKING_EXPIRED_TIME = 300000; // 5 minutes (in milliseconds) 5*60*1000

module.exports = {
    SEAT_TYPE,
    BOOKING_STATUS,
    BOOKING_EXPIRED_TIME
}