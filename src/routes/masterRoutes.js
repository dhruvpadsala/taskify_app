const express = require("express");
const router = express.Router();
const { getMasterData } = require("../controllers/masterControllers");

router.get("/", getMasterData);

module.exports = router;
