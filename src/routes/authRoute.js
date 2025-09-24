const express = require("express");
const {
  addRegister,
  addlogin,
  reLogin,
  addEmployee,
  logout,
} = require("../controllers/authControllers");
const validateAccessToken = require("../middlewares/validateAceesToken");
const validateRefreshToken = require("../middlewares/validateRefreshToken");
const router = express.Router();

router.post("/register", addRegister);
router.post(
  "/addemployee",
  validateAccessToken,
  validateRefreshToken,
  addEmployee
);
router.post("/login", addlogin);
router.post("/relogin", reLogin);

router.get("/logout", logout);

module.exports = router;
