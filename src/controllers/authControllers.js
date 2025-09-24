const jwt = require("jsonwebtoken");
const jwttoken = require("../config/jwt");
const sendResponse = require("../helpers/response");
const {
  addRegister,
  loginUser,
  relogin,
  addEmployee,
  logout,
} = require("../models/authModels");
const { poolPromise } = require("../config/db");
const sql = require("mssql");
const { hasRole } = require("../utils/hasRole");

exports.addRegister = async (req, res, next) => {
  try {
    const { com_size, mob_number, email, password } = req.body;

    // Required field validation
    const requiredFields = {
      com_name: "Company name",
      com_size: "Company size",
      mob_number: "Company mobile",
      firstname: "First name",
      lastname: "Last name",
      email: "Email",
      password: "Password",
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      if (!req.body[key]) {
        return sendResponse(res, 400, `${label} is required`, null);
      }
    }

    // Format validations
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return sendResponse(res, 400, "Invalid email format", null);
    }

    if (!/^\d{10}$/.test(mob_number)) {
      return sendResponse(res, 400, "Invalid mobile number", null);
    }

    if (isNaN(com_size) || com_size <= 0) {
      return sendResponse(
        res,
        400,
        "Company size must be a positive number",
        null
      );
    }

    if (password.length < 8 || !/\d/.test(password)) {
      return sendResponse(
        res,
        400,
        "Password must be at least 8 characters long and include a number",
        null
      );
    }

    const data = await addRegister(req, res);
  } catch (err) {
    sendResponse(res, 500, err.message, null);
  }
};

exports.addEmployee = async (req, res, next) => {
  try {
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

    const isOwnerAdmin = await hasRole(parent_role_id, ["Owner", "Admin"]);

    console.log("isOwnerAdmin", isOwnerAdmin);

    if (!isOwnerAdmin) {
      return sendResponse(
        res,
        403,
        "Only Owner or Admin can take this action",
        []
      );
    }

    console.log("req.body", req.body);

    if (
      !parent_user_id ||
      !parent_com_id ||
      !parent_role_id ||
      !role_id ||
      !firstname ||
      !lastname ||
      !email ||
      !password
    ) {
      return sendResponse(res, 400, "Missing required fields", null);
    }
    addEmployee(req, res);
  } catch (err) {
    console.log("err", err);
    sendResponse(res, 401, err.message, []);
  }
};

exports.addlogin = async (req, res, next) => {
  try {
    const { email, password, device_type_id, firebase_token } = req.body;

    if (!email || !password || !device_type_id) {
      return sendResponse(res, 400, "Missing required fields", []);
    }

    const data = await loginUser(
      email,
      password,
      device_type_id,
      firebase_token
    );

    sendResponse(res, 200, "Login successful", {
      access_token: data.accessToken,
      refresh_token: data.refreshToken,
      user: {
        id: data.user.user_id,
        email: data.user.email,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        role_id: data.user.role_id,
        com_id: data.user.com_id,
      },
    });
  } catch (err) {
    console.log("err", err);
    sendResponse(res, 401, err.message, []);
  }
};

exports.reLogin = async (req, res) => {
  try {
    const accessHeader = req.headers["authorization"];
    const refreshToken = req.headers["x-refresh-token"];

    if (!accessHeader) {
      return sendResponse(res, 401, "Access token missing", null);
    }
    if (!refreshToken) {
      return sendResponse(res, 401, "Refresh token missing", null);
    }
    relogin(req, res);
  } catch (error) {
    return sendResponse(res, 500, "Server error", null);
  }
};

exports.logout = async (req, res) => {
  try {
    const accessHeader = req.headers["authorization"];
    const refreshToken = req.headers["x-refresh-token"];

    if (!accessHeader) {
      return sendResponse(res, 401, "Access token missing", null);
    }
    if (!refreshToken) {
      return sendResponse(res, 401, "Refresh token missing", null);
    }
    logout(req, res);
  } catch (error) {
    return sendResponse(res, 500, "Server error", null);
  }
};
