// src/utils/permissions.js
const sql = require("mssql");
const { poolPromise } = require("../config/db");

async function hasRole(role_id, roleNames = []) {
  try {
    console.log("role_id, roleName", role_id, roleNames);
    const pool = await poolPromise;

    const result = await pool.request().input("role_id", sql.Int, role_id)
      .query(`
        SELECT role_name 
        FROM master.Role 
        WHERE role_id = @role_id
      `);

    if (result.recordset.length === 0) return false;

    const userRole = result.recordset[0].role_name;
    return roleNames.includes(userRole); // ✅ check if in array
  } catch (err) {
    console.error("hasRole error:", err);
    return false;
  }
}

module.exports = { hasRole };
