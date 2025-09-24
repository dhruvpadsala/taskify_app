const express = require("express");
const validateAccessToken = require("../middlewares/validateAceesToken");
const validateRefreshToken = require("../middlewares/validateRefreshToken");
const { addProject } = require("../controllers/projectController");

const router = express.Router();

router.post("/create", validateAccessToken, validateRefreshToken, addProject);

module.exports = router;
