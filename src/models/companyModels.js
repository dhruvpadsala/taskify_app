const { poolPromise } = require("../config/db");
const sql = require("mssql");
const { hasRole } = require("../utils/hasRole");
const sendResponse = require("../helpers/response");

async function getCompanyData(loginId, status) {
  try {
    const pool = await poolPromise;
    const request = pool.request();

    let query = `
      SELECT 
        c.com_id,
        c.com_name,
        c.mob_number,
        c.com_size,
        c.approved,
        c.max_users,
        c.created_at,
        c.updated_at,
        u.first_name,
        u.last_name,
        u.email
      FROM info.Company c
      LEFT JOIN auth.employee e ON e.com_id = c.com_id AND e.parent_emp_id IS NULL
      LEFT JOIN auth.users u ON u.user_id = e.user_id
    `;

    const conditions = [];

    // Optional filter by status
    if (status == 0 || status == 1) {
      conditions.push("c.approved = @status");
      request.input("status", status);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY c.updated_at DESC";

    console.log("query", query);

    const result = await request.query(query);
    return result.recordset; // return rows only
  } catch (err) {
    console.error("DB Error (getCompanyData):", err);
    throw err;
  }
}

// models/companyModels.js
async function changeCompanyAllowReq(
  user_id,
  role_id,
  com_id,
  action,
  user_allow,
  res
) {
  try {
    const isOwner = await hasRole(role_id, ["Owner"]);
    console.log("isOwner", isOwner);

    if (!isOwner) {
      return sendResponse(res, 403, "Only Owner can take this action", []);
    }

    const pool = await poolPromise;

    // 1. Check if company exists
    const companyCheck = await pool
      .request()
      .input("com_id", sql.Int, com_id)
      .query(`SELECT * FROM info.company WHERE com_id = @com_id`);

    if (companyCheck.recordset.length === 0) {
      return sendResponse(res, 404, "Company not found", []);
    }
    //2. check inputed allow and company size bigger or not
    const userCountCheck = await pool
      .request()
      .input("com_id", sql.Int, com_id)
      .query(`SELECT com_size FROM info.Company WHERE com_id = @com_id`);

    const currentUsers = userCountCheck.recordset[0].com_size;

    console.log("userCountCheck", userCountCheck, currentUsers);

    if (user_allow > currentUsers) {
      return sendResponse(
        res,
        400,
        `Cannot set allowed users less than the current company size`,
        []
      );
    }

    // 3. Perform update
    const actionUpdate = await pool
      .request()
      .input("com_id", sql.Int, com_id)
      .input("action", sql.Bit, action)
      .input("user_allow", sql.Int, user_allow).query(`
        UPDATE info.company 
        SET max_users = @user_allow ,
         approved = @action 
        WHERE com_id = @com_id
      `);

    const rowsAffected = actionUpdate.rowsAffected[0];

    if (rowsAffected > 0) {
      return sendResponse(res, 200, "Record updated successfully", {
        updated: rowsAffected,
        com_id,
        action,
      });
    } else {
      return sendResponse(res, 400, "No record updated", []);
    }
  } catch (error) {
    console.error("changeCompanyAllowReq error:", error);
    return sendResponse(res, 500, "Internal Server Error", []);
  }
}

async function getDataCompanyEmp(req, res) {
  console.log("getDataCompanyEmp", req.body);
  const { user_id } = req.body;

  try {
    const pool = await poolPromise;

    // ✅ Step 1: Get company details for given user
    const companyResult = await pool
      .request()
      .input("user_id", sql.Int, user_id).query(`
        SELECT ic.*
        FROM info.Company ic
        JOIN auth.users au ON au.com_id = ic.com_id
        WHERE au.user_id = @user_id
      `);

    if (companyResult.recordset.length === 0) {
      return sendResponse(res, 404, "Company not found for this user", null);
    }

    const company = companyResult.recordset[0];

    // ✅ Step 2: Get all employees of that company
    const empResult = await pool
      .request()
      .input("com_id", sql.Int, company.com_id).query(`
        SELECT *
        FROM auth.users u
        WHERE u.com_id = @com_id
      `);

    const employees = empResult.recordset;

    let responseData = {
      company_details: { ...company, emp_details: employees },
    };

    console.log("responseData", responseData);

    // ✅ Step 3: Response back
    return sendResponse(
      res,
      200,
      "Company and employees fetched successfully",
      responseData
    );
  } catch (error) {
    console.error("getDataCompanyEmp error:", error.message);
    return sendResponse(res, 500, "Server error", null);
  }
}

async function changeEmployeeyAllowReq(user_id, com_id, role_id, action, res) {
  try {
    const pool = await poolPromise;

    // 1. Check if company exists
    const companyCheck = await pool
      .request()
      .input("com_id", sql.Int, com_id)
      .query(`SELECT * FROM info.company WHERE com_id = @com_id`);

    if (companyCheck.recordset.length === 0) {
      return sendResponse(res, 404, "Company not found", []);
    }

    const actionUpdate = await pool
      .request()
      .input("user_id", sql.Int, user_id)
      .input("action", sql.Bit, action).query(`
        UPDATE auth.users 
        SET is_active = @action
        WHERE user_id = @user_id
      `);

    const rowsAffected = actionUpdate.rowsAffected[0];

    if (rowsAffected > 0) {
      return sendResponse(res, 200, "Record updated successfully", {
        updated: rowsAffected,
        com_id,
        action,
      });
    } else {
      return sendResponse(res, 400, "No record updated", []);
    }
  } catch (error) {
    console.error("changeCompanyAllowReq error:", error);
    return sendResponse(res, 500, "Internal Server Error", []);
  }
}

module.exports = {
  getCompanyData,
  changeCompanyAllowReq,
  getDataCompanyEmp,
  changeEmployeeyAllowReq,
};
