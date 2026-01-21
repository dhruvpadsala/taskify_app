const { poolPromise } = require("../config/db");

async function getMasterData(masterName, com_id) {
  const pool = await poolPromise;

  // Tables that need com_id filter
  const com_idMasters = ["task_type", "task_status", "priority"];

  if (masterName) {
    const masters = masterName.split(",").map((m) => m.trim());
    const queries = masters.map((m) => {
      const request = pool.request();
      if (com_id && com_idMasters.includes(m)) {
        request.input("com_id", com_id);
        return request.query(
          `SELECT * FROM master.${m} WHERE com_id = @com_id`
        );
      } else {
        return request.query(`SELECT * FROM master.${m}`);
      }
    });

    const results = await Promise.all(queries);

    const data = {};
    masters.forEach((m, i) => {
      data[m] = results[i].recordset;
    });

    return data;
  } else {
    console.log("comIdddd", com_id);
    const [os, role, permission, task_type, task_status, priority] =
      await Promise.all([
        pool.request().query("SELECT * FROM master.os"), // no com_id
        pool.request().query("SELECT * FROM master.role"), // no com_id
        pool.request().query("SELECT * FROM master.permission"), // no com_id
        com_id
          ? pool
              .request()
              .input("com_id", com_id)
              .query("SELECT * FROM master.task_type WHERE com_id = @com_id")
          : pool.request().query("SELECT * FROM master.task_type"),
        com_id
          ? pool
              .request()
              .input("com_id", com_id)
              .query("SELECT * FROM master.task_status WHERE com_id = @com_id")
          : pool.request().query("SELECT * FROM master.task_status"),
        com_id
          ? pool
              .request()
              .input("com_id", com_id)
              .query("SELECT * FROM master.priority WHERE com_id = @com_id")
          : pool.request().query("SELECT * FROM master.priority"),
      ]);

    return {
      os: os.recordset,
      role: role.recordset,
      permission: permission.recordset,
      task_type: task_type.recordset,
      task_status: task_status.recordset,
      priority: priority.recordset,
    };
  }
}

module.exports = { getMasterData };
