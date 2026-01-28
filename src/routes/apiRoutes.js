const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const pasienController = require("../controllers/pasienController");
const simpanController = require("../controllers/simpanController");

router.post("/login", authController.loginUser);
router.get("/pasien/:noReg", pasienController.getPasienByReg);
router.post("/simpan", simpanController.postSimpan);

module.exports = router;
