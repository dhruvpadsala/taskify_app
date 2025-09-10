// models/masterModels.js
const { poolPromise } = require("../config/db");

async function getMasterData(masterName) {
  const pool = await poolPromise;

  if (masterName) {
    // ✅ support multiple masters: ?master=role,permission
    const masters = masterName.split(",").map((m) => m.trim());
    const queries = masters.map((m) =>
      pool.request().query(`SELECT * FROM master.${m}`)
    );

    const results = await Promise.all(queries);

    const data = {};
    masters.forEach((m, i) => {
      data[m] = results[i].recordset;
    });

    return data;
  } else {
    // ✅ return all masters in parallel
    const [os, role, permission] = await Promise.all([
      pool.request().query("SELECT * FROM master.os"),
      pool.request().query("SELECT * FROM master.role"),
      pool.request().query("SELECT * FROM master.permission"),
    ]);

    return {
      os: os.recordset,
      role: role.recordset,
      permission: permission.recordset,
    };
  }
}

module.exports = { getMasterData };
