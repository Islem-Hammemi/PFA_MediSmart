
const express = require("express");
const router = express.Router();

const {
  registerPatient,
  loginPatient,
  loginMedecin,
  logout,
  getMe,
} = require("../presentation/authController");

const { proteger } = require("../middleware/authMiddleware");


router.post("/patient/register", registerPatient);


router.post("/patient/login", loginPatient);


router.post("/medecin/login", loginMedecin);


router.get("/me", proteger, getMe);

router.post("/logout", proteger, logout);



const { verifyToken } = require("../middleware/authMiddleware");
 
const { createEvaluation } = require("../presentation/evaluationcontroller");
 
router.post("/", verifyToken, createEvaluation);
 
module.exports = router;