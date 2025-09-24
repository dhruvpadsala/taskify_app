const express = require("express");
const {
  allPendingCompanyReq,
  changeCompanyAllowRequest,
  allCompanyWiseEmployee,
  changeEmployeeAllowRequest,
} = require("../controllers/companyController");
const validateAccessToken = require("../middlewares/validateAceesToken");
const validateRefreshToken = require("../middlewares/validateRefreshToken");
const router = express.Router();

router.get(
  "/request",
  validateAccessToken,
  validateRefreshToken,
  allPendingCompanyReq
);

router.post(
  "/details/company/emp",
  validateAccessToken,
  validateRefreshToken,
  allCompanyWiseEmployee
);

router.post(
  "/change/company/allow/request",
  validateAccessToken,
  validateRefreshToken,
  changeCompanyAllowRequest
);

router.post(
  "/change/employee/allow/request",
  validateAccessToken,
  validateRefreshToken,
  changeEmployeeAllowRequest
);

module.exports = router;
