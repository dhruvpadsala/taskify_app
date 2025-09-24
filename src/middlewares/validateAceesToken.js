const jwt = require("jsonwebtoken");
const jwttoken = require("../config/jwt");
const sendResponse = require("../helpers/response");
const { poolPromise } = require("../config/db");
const sql = require("mssql");

async function validateAccessToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const refreshToken = req.headers["x-refresh-token"];
    console.log("req", req.body);

    if (!authHeader) {
      return sendResponse(res, 401, "Access token missing", null);
    }
    if (!refreshToken) {
      return sendResponse(res, 401, "Refresh token missing", null);
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, jwttoken.accessSecret);
    } catch (err) {
      console.error("Access token error:", err.message);
      return sendResponse(res, 401, "Invalid or expired access token", null);
    }

    // 🔹 Step 2: Check login_id in DB
    console.log("decoded", decoded, authHeader);
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("login_id", sql.Int, decoded.loginId)
      .input("token", sql.NVarChar, token)
      .query(
        `SELECT login_id FROM auth.login WHERE login_id = @login_id and token=@token`
      );

    if (result.recordset.length === 0) {
      return sendResponse(
        res,
        401,
        "Invalid session. Please login again.",
        null
      );
    }

    // Attach user info for later use
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token middleware error:", error.message);
    return sendResponse(res, 500, "Server Error", null);
  }
}

module.exports = validateAccessToken;
