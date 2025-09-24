const jwt = require("jsonwebtoken");
const jwttoken = require("../config/jwt");
const sendResponse = require("../helpers/response");
const { poolPromise } = require("../config/db"); // adjust path
const sql = require("mssql");

async function validateRefreshToken(req, res, next) {
  try {
    console.log("validateRefreshToken");
    const refreshToken = req.headers["x-refresh-token"];
    if (!refreshToken) {
      return sendResponse(res, 401, "Refresh token required", null);
    }

    let decoded;
    try {
      // Step 1: verify refresh token
      decoded = jwt.verify(refreshToken, jwttoken.refreshSecret);
      console.log("decoded", decoded);
    } catch (err) {
      console.error("Refresh token error:", err.message);
      return sendResponse(res, 401, "Invalid or expired refresh token", null);
    }

    // Step 2: check refresh token in DB against login_id
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("login_id", sql.Int, decoded.loginId)
      .input("refresh_token", sql.NVarChar, refreshToken)
      .query(
        `SELECT login_id, token 
         FROM auth.login 
         WHERE login_id = @login_id AND refresh_token = @refresh_token`
      );

    if (result.recordset.length === 0) {
      return sendResponse(
        res,
        401,
        "Refresh token not valid for this user",
        null
      );
    }

    // Step 3: attach decoded user payload for later usage
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token middleware error:", error.message);
    return sendResponse(res, 500, "Server Error", null);
  }
}

module.exports = validateRefreshToken;
