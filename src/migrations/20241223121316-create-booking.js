'use strict';
/** @type {import('sequelize-cli').Migration} */
const { Enums } = require('../utils/comman');
const { INITIATED, PENDING, BOOKED, CANCELLED } = Enums.BOOKING_STATUS

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      flightId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      useId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        allowNull: false,
        values: [INITIATED, PENDING, BOOKED, CANCELLED],
        defaultValue: INITIATED
      },
      noOfSeats: {  // how many sheet are booked
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      totalCost: {
        type: Sequelize.FLOAT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bookings');
  }
};