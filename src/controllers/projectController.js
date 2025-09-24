const jwt = require("jsonwebtoken");
const jwttoken = require("../config/jwt");
const sendResponse = require("../helpers/response");
const { poolPromise } = require("../config/db");
const sql = require("mssql");
const { hasRole } = require("../utils/hasRole");

exports.addProject = async (req, res, next) => {
  try {
    console.log("req", req.body);
  } catch (err) {
    sendResponse(res, 500, err.message, null);
  }
};
