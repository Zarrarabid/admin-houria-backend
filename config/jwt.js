// config/jwt.js
require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d' // Default to 1 hour if not specified in .env
    // You could add more properties here if needed, e.g.:
    // refreshSecret: process.env.JWT_REFRESH_SECRET,
    // refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    // audience: 'your-app-audience',
    // issuer: 'your-app-issuer'
};