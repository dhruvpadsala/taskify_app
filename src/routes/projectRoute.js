const express = require("express");
const validateAccessToken = require("../middlewares/validateAceesToken");
const validateRefreshToken = require("../middlewares/validateRefreshToken");
const {
  addProject,
  addFeature,
  addTask,
  listOfProject,
  listOfFeature,
  listOfTask,
  taskStatusChange,
} = require("../controllers/projectController");

const router = express.Router();

router.post(
  "/project/create",
  validateAccessToken,
  validateRefreshToken,
  addProject
);

router.post(
  "/feature/create",
  validateAccessToken,
  validateRefreshToken,
  addFeature
);

router.post("/task/create", validateAccessToken, validateRefreshToken, addTask);

router.post(
  "/project/list",
  validateAccessToken,
  validateRefreshToken,
  listOfProject
);

router.post(
  "/feature/list",
  validateAccessToken,
  validateRefreshToken,
  listOfFeature
);

router.post(
  "/task/list",
  validateAccessToken,
  validateRefreshToken,
  listOfTask
);

router.post(
  "/task/status",
  validateAccessToken,
  validateRefreshToken,
  taskStatusChange
);

module.exports = router;
