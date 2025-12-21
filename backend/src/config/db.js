/*
 * Database configuration
 *
 * This module initialises and exports a Sequelize instance configured
 * to connect to a PostgreSQL database. The connection parameters are
 * pulled from environment variables. When run inside Docker the
 * variables can be defined in a .env file or through compose.
 */

const { Sequelize } = require('sequelize');

const DB_NAME = process.env.DB_NAME || 'nebria';
const DB_USER = process.env.DB_USER || 'nebria';
const DB_PASS = process.env.DB_PASS || 'nebria';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;