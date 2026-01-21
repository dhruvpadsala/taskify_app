const sendResponse = require("../helpers/response");
const {
  getCompanyData,
  changeCompanyAllowReq,
  getDataCompanyEmp,
  changeEmployeeyAllowReq,
  getProjectEmp,
} = require("../models/companyModels");
const { hasRole } = require("../utils/hasRole");

exports.allPendingCompanyReq = async (req, res, next) => {
  try {
    const { loginId, status } = req.query;
    console.log("loginId", loginId, status);
    const data = await getCompanyData(loginId, status);
    sendResponse(res, 200, "Success API load", data);
  } catch (error) {}
};

exports.allCompanyWiseEmployee = async (req, res, next) => {
  const { user_id, role_id } = req.body;

  console.log(" user_id, role_id", user_id, role_id);

  // 1. Validate payload
  if (!user_id || !role_id) {
    return sendResponse(res, 400, "Missing required fields", []);
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

  getDataCompanyEmp(req, res);
};

exports.changeCompanyAllowRequest = async (req, res, next) => {
  try {
    const { user_id, role_id, com_id, action, user_allow } = req.body;

    // 1. Validate payload
    if (
      user_id == null ||
      role_id == null ||
      com_id == null ||
      action == null ||
      user_allow == null
    ) {
      return sendResponse(res, 400, "Missing required fields", []);
    }

    // 2. Call service
    await changeCompanyAllowReq(
      user_id,
      role_id,
      com_id,
      action,
      user_allow,
      res
    );
  } catch (error) {
    console.error("Controller error:", error);
    return sendResponse(res, 500, "Internal Server Error", []);
  }
};

exports.changeEmployeeAllowRequest = async (req, res, next) => {
  try {
    const { user_id, com_id, role_id, action } = req.body;

    // 1. Validate payload
    if (user_id == null || role_id == null || action == null) {
      return sendResponse(res, 400, "Missing required fields", []);
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

    // 2. Call service
    await changeEmployeeyAllowReq(user_id, com_id, role_id, action, res);
  } catch (error) {
    console.error("Controller error:", error);
    return sendResponse(res, 500, "Internal Server Error", []);
  }
};

exports.allprojectEmp = async (req, res, next) => {
  try {
    const { com_id, search } = req.query;

    console.log("allprojectEmp", com_id, search);

    if (!com_id) {
      return sendResponse(res, 400, "Missing required fields", []);
    }
    await getProjectEmp(req, res);
  } catch (error) {}
};
