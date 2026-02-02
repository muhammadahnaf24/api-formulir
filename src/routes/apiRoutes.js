const express = require("express");
const router = express.Router();
const loginController = require("../controllers/loginController");
const pasienController = require("../controllers/pasienController");
const simpanController = require("../controllers/simpanController");

router.post("/login", loginController.loginUser);
router.get("/pasien/:noReg", pasienController.getPasienByReg);
router.post("/simpan", simpanController.postSimpan);

module.exports = router;
