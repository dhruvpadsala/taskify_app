const express = require("express");
const { addRegister, addlogin } = require("../controllers/authControllers");
const router = express.Router();

router.post("/register", addRegister);
router.post("/login", addlogin);

module.exports = router;
