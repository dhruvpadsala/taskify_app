const bcrypt = require("bcrypt");
const sendResponse = require("../helpers/response");
const { poolPromise } = require("../config/db");
const sql = require("mssql");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");

async function addRegister(req, res) {
  try {
    const {
      com_name,
      com_size,
      mob_number,
      firstname,
      lastname,
      email,
      password,
    } = req.body;

    if (!com_name || !mob_number || !email || !password) {
      return sendResponse(res, 400, "Missing required fields", null);
    }

    const pool = await poolPromise;

    // ✅ Check duplicates
    const duplicateCheck = await pool
      .request()
      .input("com_name", sql.VarChar, com_name)
      .input("mob_number", sql.VarChar, mob_number)
      .input("email", sql.VarChar, email).query(`
        SELECT 
          (SELECT COUNT(1) FROM auth.users WHERE email = @email) AS emailExists,
          (SELECT COUNT(1) FROM info.company WHERE mob_number = @mob_number) AS mobileExists,
          (SELECT COUNT(1) FROM info.company WHERE com_name = @com_name) AS companyExists
      `);

    const { emailExists, mobileExists, companyExists } =
      duplicateCheck.recordset[0];

    if (emailExists > 0) {
      return sendResponse(res, 409, "Email already registered", []);
    }
    if (mobileExists > 0) {
      return sendResponse(res, 409, "Mobile number already registered", []);
    }
    if (companyExists > 0) {
      return sendResponse(res, 409, "Company name already exists", []);
    }

    // 🔐 Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // ✅ Call SP
    const result = await pool
      .request()
      .input("com_name", sql.VarChar, com_name)
      .input("com_size", sql.Int, com_size)
      .input("mob_number", sql.VarChar, mob_number)
      .input("firstname", sql.VarChar, firstname)
      .input("lastname", sql.VarChar, lastname)
      .input("email", sql.VarChar, email)
      .input("password_hash", sql.VarChar, password_hash)
      .execute("sp_register_company_user");

    const data = result.recordset[0];
    return sendResponse(
      res,
      201,
      "Registration successful! Your details have been submitted for review.",
      data
    );
  } catch (err) {
    console.error("Error in addRegister:", err);
    return sendResponse(res, 500, err.message, null);
  }
}

// ✅ Generate Access + Refresh Tokens
function generateTokens(payload) {
  const accessToken = jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiry,
  });
  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiry,
  });
  return { accessToken, refreshToken };
}

// ✅ Login logic
async function loginUser(email, password, deviceTypeId, firebaseToken = null) {
  const pool = await poolPromise;

  // 1. Find user
  const userResult = await pool
    .request()
    .input("email", sql.VarChar, email)
    .query("SELECT * FROM auth.users WHERE email = @email");

  if (userResult.recordset.length === 0) {
    throw new Error("Invalid email or password");
  }

  //2. Check user's company is allowed or not
  const userActiveCom = await pool
    .request()
    .input("email", sql.VarChar, email)
    .query(
      "SELECT * FROM auth.users u LEFT JOIN info.Company c ON c.com_id= u.com_id WHERE u.email=@email AND c.approved=1"
    );

  console.log("userActiveCom", userActiveCom);
  if (userActiveCom.recordset.length == 0) {
    throw new Error("Your company is not Active yet");
  }

  const user = userResult.recordset[0];

  // 3. Check password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  if (user.is_active === 0) {
    throw new Error("User is inactive. Contact admin.");
  }

  // 4. Generate tokens
  const payload = {
    userId: user.user_id,
    email: user.email,
    roleId: user.role_id,
  };
  const { accessToken, refreshToken } = generateTokens(payload);

  // 5. Store session in login table
  await pool
    .request()
    .input("user_id", sql.Int, user.user_id)
    .input("device_type_id", sql.Int, deviceTypeId)
    .input("token", sql.NVarChar, accessToken)
    .input("refresh_token", sql.NVarChar, refreshToken)
    .input("firebase_token", sql.NVarChar, firebaseToken).query(`
      INSERT INTO auth.login (user_id, device_type_id, token, refresh_token, firebase_token)
      VALUES (@user_id, @device_type_id, @token, @refresh_token, @firebase_token)
    `);

  return { accessToken, refreshToken, user };
}

module.exports = {
  addRegister,
  loginUser,
};
