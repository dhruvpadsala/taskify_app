require("dotenv").config();

module.exports = {
  accessSecret: process.env.accessSecret, // keep in .env
  refreshSecret: process.env.refreshSecret, // keep in .env
  accessExpiry: "1d", // short-lived access token
  refreshExpiry: "7d", // refresh token life
};
