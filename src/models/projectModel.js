const sendResponse = require("../helpers/response");
const { poolPromise } = require("../config/db");
const sql = require("mssql");

async function addProject(req, res) {
  try {
    // Get DB connection pool
    const { com_id, project_name, description, user_id } = req.body;
    const pool = await poolPromise;

    // Execute stored procedure
    const result = await pool
      .request()
      .input("com_id", sql.Int, com_id)
      .input("project_name", sql.VarChar(255), project_name)
      .input("description", sql.VarChar(255), description || null)
      .input("user_id", sql.Int, user_id)
      .execute("sp_add_project");

    // If your SP returns data (we added SELECT in last version)
    const data = result.recordset?.[0] || null;

    return sendResponse(res, 200, "Project created successfully", data);
  } catch (err) {
    console.error("Error in addProject:", err);
    return sendResponse(res, 500, err.message || "Internal Server Error", null);
  }
}

async function addFeature(req, res) {
  try {
    // Get DB connection pool
    const { project_id, feature_name, description, user_id } = req.body;
    const pool = await poolPromise;

    // Execute stored procedure
    const result = await pool
      .request()
      .input("project_id", sql.Int, project_id)
      .input("feature_name", sql.VarChar(255), feature_name)
      .input("description", sql.VarChar(255), description || null)
      .input("user_id", sql.Int, user_id)
      .execute("sp_add_feature");

    // If your SP returns data (we added SELECT in last version)
    const data = result.recordset?.[0] || null;

    return sendResponse(res, 200, "Feature created successfully", data);
  } catch (err) {
    console.error("Error in addProject:", err);
    return sendResponse(res, 500, err.message || "Internal Server Error", null);
  }
}

async function addTask(req, res) {
  try {
    const {
      feature_id,
      task_name,
      description,
      type_id,
      priority_id,
      reporter_id,
      assigned_to,
      due_date,
    } = req.body;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("feature_id", sql.Int, feature_id)
      .input("task_name", sql.VarChar(255), task_name)
      .input("description", sql.VarChar(255), description || null)
      .input("type_id", sql.Int, type_id)
      .input("priority_id", sql.Int, priority_id)
      .input("due_date", sql.Date, due_date)
      .input("reporter_id", sql.Int, reporter_id)
      .input("assigned_to", sql.Int, assigned_to)
      .execute("sp_add_task");

    // If your SP returns data (we added SELECT in last version)
    const data = result.recordset?.[0] || null;

    return sendResponse(res, 200, "Feature created successfully", data);
  } catch (err) {
    console.error("Error in addProject:", err);
    return sendResponse(res, 500, err.message || "Internal Server Error", null);
  }
}

async function listOfProject(req, res) {
  try {
    const { com_id } = req.body;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("com_id", sql.Int, com_id)
      .execute("sp_list_project");

    // If your SP returns data (we added SELECT in last version)
    console.log("result==>", result);
    const data = result.recordset || [];

    console.log("data", data);

    return sendResponse(res, 200, "Project list successfully", data);
  } catch (error) {
    console.error("Error in addProject:", err);
    return sendResponse(res, 500, err.message || "Internal Server Error", null);
  }
}

async function listOfFeature(req, res) {
  try {
    const { com_id, project_id } = req.body;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("com_id", sql.Int, com_id)
      .input("project_id", sql.Int, project_id)
      .execute("sp_list_feature");

    // If your SP returns data (we added SELECT in last version)
    console.log("result==>", result);
    const data = result.recordset || [];

    console.log("data", data);

    return sendResponse(res, 200, "Feature list successfully", data);
  } catch (error) {
    console.error("Error in addProject:", err);
    return sendResponse(res, 500, err.message || "Internal Server Error", null);
  }
}

async function listOfTask(req, res) {
  try {
    const { user_id, com_id, status_id } = req.body;

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("com_id", sql.Int, com_id)
      .input("user_id", sql.Int, user_id)
      .input("status_ids", sql.NVarChar, status_id)
      .execute("sp_list_task");

    // If your SP returns data (we added SELECT in last version)
    console.log("result==>", result);

    const raw = result.recordset[0].json_result;
    const parsed = JSON.parse(raw);

    return sendResponse(res, 200, "Task list successfully", parsed);
  } catch (error) {
    console.error("Error in addProject:", err);
    return sendResponse(res, 500, err.message || "Internal Server Error", null);
  }
}

async function taskStatusChange(req, res) {
  try {
    const { task_id, next_status_id } = req.body;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("task_id", sql.Int, task_id)
      .input("next_status_id", sql.Int, next_status_id)
      .execute("sp_change_task_status");

    // If your SP returns data (we added SELECT in last version)
    console.log("result==>", result);
    const data = result.recordset || [];

    console.log("data", data);

    return sendResponse(res, 200, "Task status changed", data);
  } catch (error) {
    console.error("Error in addProject:", err);
    return sendResponse(res, 500, err.message || "Internal Server Error", null);
  }
}

module.exports = {
  addProject,
  addFeature,
  addTask,
  listOfProject,
  listOfFeature,
  listOfTask,
  taskStatusChange,
};
