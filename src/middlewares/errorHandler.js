const sendResponse = require("../helpers/response");

function errorHandler(err, req, res, next) {
  console.error(err);
  sendResponse(res, 500, err.message || "Server Error", []);
}

module.exports = errorHandler;
