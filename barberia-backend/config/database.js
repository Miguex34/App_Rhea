const { Sequelize } = require('sequelize');
require('dotenv').config(); // Cargar las variables de entorno

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    dialectOptions: {
      connectTimeout: 60000, // Extiende el tiempo de espera
    },
  }
);

module.exports = sequelize;