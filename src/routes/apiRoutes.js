const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const pasienController = require("../controllers/pasienController");

router.post("/login", authController.loginUser);
router.get("/pasien/:noReg", pasienController.getPasienByReg);

module.exports = router;
