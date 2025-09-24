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

async function addEmployee(req, res) {
  const {
    parent_user_id,
    parent_com_id,
    parent_role_id,
    role_id,
    firstname,
    lastname,
    email,
    password,
  } = req.body;

  try {
    const pool = await poolPromise;

    // 🔹 Step 1: Check if email already exists
    const emailCheck = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query(`SELECT COUNT(1) AS count FROM auth.users WHERE email = @email`);

    if (emailCheck.recordset[0].count > 0) {
      return sendResponse(res, 409, "Email already registered", null);
    }

    // 🔹 Step 2: Verify company exists & approved
    const companyCheck = await pool
      .request()
      .input("com_id", sql.Int, parent_com_id)
      .query(`SELECT approved FROM info.Company WHERE com_id = @com_id`);

    if (companyCheck.recordset.length === 0) {
      return sendResponse(res, 404, "Company not found", null);
    }
    if (companyCheck.recordset[0].approved != 1) {
      return sendResponse(res, 403, "Company not approved", null);
    }

    const parentisActive = await pool
      .request()
      .input("user_id", sql.Int, parent_user_id)
      .query(
        `SELECT is_active FROM auth.users WHERE user_id = @user_id and is_active=1 `
      );

    if (parentisActive.recordset.length === 0) {
      return sendResponse(res, 404, "User not found", null);
    }
    if (parentisActive.recordset[0].is_active != 1) {
      return sendResponse(res, 403, "You are not active", null);
    }

    const companyallowUser = await pool
      .request()
      .input("com_id", sql.Int, parent_com_id)
      .query(
        `SELECT 
    CASE 
        WHEN COUNT(u.user_id) >= c.max_users THEN 1 
        ELSE 0 
    END AS limit_reached
FROM info.Company c
LEFT JOIN auth.users u ON u.com_id = c.com_id
WHERE c.com_id = @com_id
GROUP BY c.max_users;`
      );
    console.log("companyallowUser", companyallowUser);
    if (companyallowUser.recordset[0].limit_reached == 1) {
      return sendResponse(
        res,
        403,
        "Your employee register max limit Reached",
        null
      );
    }
    // 🔹 Step 3: Insert employee (with parent_id)

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    const result = await pool
      .request()
      .input("firstname", sql.VarChar, firstname)
      .input("lastname", sql.VarChar, lastname)
      .input("email", sql.VarChar, email)
      .input("password_hash", sql.NVarChar, password_hash) // hash later!
      .input("com_id", sql.Int, parent_com_id)
      .input("role_id", sql.Int, role_id)
      .input("parent_id", sql.Int, parent_user_id || null)
      .execute("sp_register_employee");

    return sendResponse(
      res,
      201,
      "Employee added successfully",
      result.recordset[0]
    );
  } catch (error) {
    console.error("addEmployee error:", error.message);
    return sendResponse(res, 500, "Server error", null);
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

  const user = userResult.recordset[0];

  // 2. Check user's company is allowed
  const userActiveCom = await pool
    .request()
    .input("email", sql.VarChar, email)
    .query(
      "SELECT * FROM auth.users u LEFT JOIN info.Company c ON c.com_id= u.com_id WHERE u.email=@email AND c.approved=1"
    );

  if (userActiveCom.recordset.length === 0) {
    throw new Error("Your company is not Active yet");
  }

  //3. user is Active
  const userIsActive = await pool
    .request()
    .input("email", sql.VarChar, email)
    .query("SELECT * FROM auth.users WHERE email=@email AND is_active=1");

  if (userIsActive.recordset.length === 0) {
    throw new Error("User is not Active yet , Contact your Admin");
  }

  // 3. Check password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  if (user.is_active === 0) {
    throw new Error("User is inactive. Contact admin.");
  }

  // 4. Insert a login row FIRST to generate login_id
  const loginInsert = await pool
    .request()
    .input("user_id", sql.Int, user.user_id)
    .input("device_type_id", sql.Int, deviceTypeId)
    .input("firebase_token", sql.NVarChar, firebaseToken).query(`
      INSERT INTO auth.login (user_id, device_type_id, firebase_token)
      OUTPUT INSERTED.login_id
      VALUES (@user_id, @device_type_id, @firebase_token)
    `);

  const login_id = loginInsert.recordset[0].login_id;

  // 5. Generate tokens including login_id
  const payload = {
    userId: user.user_id,
    email: user.email,
    roleId: user.role_id,
    loginId: login_id, // 🔑 include this
  };

  const { accessToken, refreshToken } = generateTokens(payload);

  // 6. Update login row with tokens
  await pool
    .request()
    .input("login_id", sql.Int, login_id)
    .input("token", sql.NVarChar, accessToken)
    .input("refresh_token", sql.NVarChar, refreshToken).query(`
      UPDATE auth.login 
      SET token = @token, refresh_token = @refresh_token 
      WHERE login_id = @login_id
    `);

  // 7. Return result
  return { accessToken, refreshToken, user };
}

async function relogin(req, res) {
  const accessHeader = req.headers["authorization"];
  const refreshToken = req.headers["x-refresh-token"];

  if (!accessHeader) {
    return sendResponse(res, 401, "Access token missing", null);
  }
  if (!refreshToken) {
    return sendResponse(res, 401, "Refresh token missing", null);
  }

  const accessToken = accessHeader.split(" ")[1];
  let decodedAccess = null;
  let newAccessToken = accessToken;
  let newRefreshToken = refreshToken;

  try {
    // Step 1: Verify access token directly
    decodedAccess = jwt.verify(accessToken, jwtConfig.accessSecret);
  } catch (err) {
    console.log("err", err);
    if (err.name === "TokenExpiredError") {
      // Step 2: Access expired → check refresh token
      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          jwtConfig.refreshSecret
        );

        // Generate new tokens
        newAccessToken = jwt.sign(
          {
            userId: decodedRefresh.userId,
            roleId: decodedRefresh.roleId,
            loginId: decodedRefresh.loginId,
          },
          jwtConfig.accessSecret,
          { expiresIn: jwtConfig.accessExpiry }
        );

        newRefreshToken = jwt.sign(
          {
            userId: decodedRefresh.userId,
            roleId: decodedRefresh.roleId,
            loginId: decodedRefresh.loginId,
          },
          jwtConfig.refreshSecret,
          { expiresIn: jwtConfig.refreshExpiry }
        );

        decodedAccess = decodedRefresh; // reuse payload
      } catch (refreshErr) {
        console.log("refreshErr", refreshErr);
        return sendResponse(
          res,
          401,
          "Session expired. Please login again",
          null
        );
      }
    } else {
      return sendResponse(res, 401, "Invalid access token", null);
    }
  }

  try {
    const pool = await poolPromise;

    // Step 3: Validate user
    console.log("decodedAccess", decodedAccess);
    const result = await pool
      .request()
      .input("userId", sql.Int, decodedAccess.userId)
      .query(`SELECT u.user_id, u.email,u.first_name , u.last_name,u.role_id, u.com_id ,u.is_active, c.approved  AS company_allowed
        FROM auth.users u
        JOIN info.Company c ON c.com_id = u.com_id
        WHERE u.user_id = @userId
      `);

    if (result.recordset.length === 0) {
      return sendResponse(res, 404, "User not found", null);
    }

    const user = result.recordset[0];
    console.log("user", user);
    if (user.company_allowed != 1) {
      return sendResponse(res, 403, "Company is not active/approved", null);
    }
    if (user.is_active != 1) {
      return sendResponse(res, 403, "User is inactive. Contact admin.", null);
    }

    // Step 4: Update DB with new tokens
    await pool
      .request()
      .input("login_id", sql.Int, decodedAccess.loginId)
      .input("token", sql.NVarChar, newAccessToken)
      .input("refresh_token", sql.NVarChar, newRefreshToken).query(`
        UPDATE auth.login
        SET token = @token, refresh_token = @refresh_token
        WHERE login_id = @login_id
      `);

    // Step 5: Return updated tokens
    return sendResponse(res, 200, "Re-login successful", {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      user,
    });
  } catch (error) {
    console.error("reLogin error:", error.message);
    return sendResponse(res, 500, "Server error", null);
  }
}

async function logout(req, res) {
  const accessHeader = req.headers["authorization"];
  const refreshToken = req.headers["x-refresh-token"];

  const accessToken = accessHeader.split(" ")[1];

  try {
    const decoded = jwt.decode(accessToken); // decode without verify (token may be expired)

    if (!decoded || !decoded.loginId) {
      return sendResponse(res, 401, "Invalid token", null);
    }

    const pool = await poolPromise;

    // ✅ Invalidate tokens from DB
    await pool.request().input("login_id", sql.Int, decoded.loginId).query(`
        UPDATE auth.login
        SET token = NULL, refresh_token = NULL
        WHERE login_id = @login_id
      `);

    return sendResponse(res, 200, "Logout successful", null);
  } catch (error) {
    console.error("Logout error:", error.message);
    return sendResponse(res, 500, "Server error", null);
  }
}

module.exports = {
  addRegister,
  addEmployee,
  loginUser,
  relogin,
  logout,
};
