const sendResponse = require("../helpers/response");
const { hasRole } = require("../utils/hasRole");
const {
  addProject,
  addFeature,
  addTask,
  listOfProject,
  listOfFeature,
  listOfTask,
  taskStatusChange,
} = require("../models/projectModel");

exports.addProject = async (req, res, next) => {
  try {
    console.log("req", req.body);
    const { com_id, project_name, user_id, role_id } = req.body;

    if (!com_id || !project_name || !user_id || !role_id) {
      return sendResponse(res, 400, "Required All parameter", null);
    }

    const isOwnerAdmin = await hasRole(role_id, ["Owner", "Admin"]);
    console.log("isOwnerAdmin", isOwnerAdmin);

    if (!isOwnerAdmin) {
      return sendResponse(
        res,
        403,
        "Only Owner or Admin can take this action",
        []
      );
    }
    addProject(req, res);
  } catch (err) {
    sendResponse(res, 500, err.message, null);
  }
};

exports.addFeature = async (req, res, next) => {
  try {
    console.log("req", req.body);
    const { project_id, feature_name, description, role_id, user_id } =
      req.body;

    if (!project_id || !feature_name || !description || !role_id || !user_id) {
      return sendResponse(res, 400, "Required All parameter", null);
    }

    const isOwnerAdminEmp = await hasRole(role_id, [
      "Owner",
      "Admin",
      "Agile Facilitator",
    ]);
    console.log("isOwnerAdminEmp", isOwnerAdminEmp);

    if (!isOwnerAdminEmp) {
      return sendResponse(
        res,
        403,
        "Only Owner , Admin ,Agile facilator can take this action",
        []
      );
    }
    addFeature(req, res);
  } catch (err) {
    sendResponse(res, 500, err.message, null);
  }
};

exports.addTask = async (req, res, next) => {
  try {
    console.log("req", req.body);
    const {
      feature_id,
      task_name,
      type_id,
      priority_id,
      reporter_id,
      assigned_to,
      role_id,
      due_date,
    } = req.body;

    if (
      (!feature_id,
      !task_name,
      !type_id,
      !priority_id,
      !reporter_id,
      !assigned_to,
      !due_date)
    ) {
      return sendResponse(res, 400, "Required All parameter", null);
    }

    const isOwnerAdminEmp = await hasRole(role_id, [
      "Owner",
      "Admin",
      "Agile Facilitator",
    ]);
    console.log("isOwnerAdminEmp", isOwnerAdminEmp);

    if (!isOwnerAdminEmp) {
      return sendResponse(
        res,
        403,
        "Only Owner , Admin ,Agile facilator can take this action",
        []
      );
    }
    addTask(req, res);
  } catch (err) {
    sendResponse(res, 500, err.message, null);
  }
};

exports.listOfProject = async (req, res, next) => {
  try {
    const { role_id, com_id } = req.body;

    if (!role_id || !com_id) {
      return sendResponse(res, 400, "Required All parameter", null);
    }

    const isOwnerAdminEmp = await hasRole(role_id, [
      "Owner",
      "Admin",
      "Agile Facilitator",
    ]);
    console.log("isOwnerAdminEmp", isOwnerAdminEmp);

    if (!isOwnerAdminEmp) {
      return sendResponse(
        res,
        403,
        "Only Owner , Admin ,Agile facilator can take this action",
        []
      );
    }
    await listOfProject(req, res);
  } catch (err) {
    sendResponse(res, 500, err.message, null);
  }
};

exports.listOfFeature = async (req, res, next) => {
  try {
    const { role_id, com_id, project_id } = req.body;

    if (!role_id || !com_id || !project_id) {
      return sendResponse(res, 400, "Required All parameter", null);
    }

    const isOwnerAdminEmp = await hasRole(role_id, [
      "Owner",
      "Admin",
      "Agile Facilitator",
    ]);
    console.log("isOwnerAdminEmp", isOwnerAdminEmp);

    if (!isOwnerAdminEmp) {
      return sendResponse(
        res,
        403,
        "Only Owner , Admin ,Agile facilator can take this action",
        []
      );
    }
    await listOfFeature(req, res);
  } catch (err) {
    sendResponse(res, 500, err.message, null);
  }
};

exports.listOfTask = async (req, res, next) => {
  try {
    const { user_id, com_id, status_id } = req.body;

    if (!user_id || !com_id || !status_id) {
      return sendResponse(res, 400, "Required All parameter", null);
    }

    await listOfTask(req, res);
  } catch (err) {
    sendResponse(res, 500, err.message, null);
  }
};

exports.taskStatusChange = async (req, res, next) => {
  try {
    const { task_id, next_status_id } = req.body;

    if (!task_id || !next_status_id) {
      return sendResponse(res, 400, "Required All parameter", null);
    }

    await taskStatusChange(req, res);
  } catch (err) {
    sendResponse(res, 500, err.message, null);
  }
};
