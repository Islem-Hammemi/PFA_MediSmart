// =============================================
// routes/authRoutes.js
// Définition des routes d'authentification
// =============================================
const express = require("express");
const router = express.Router();

const {
  registerPatient,
  loginPatient,
  loginMedecin,
  login,
  logout,
  getMe,
} = require("../presentation/authController");

const { proteger } = require("../middleware/authMiddleware");

// ── Patient ──────────────────────────────────────────────────────────────────
// US3 : Inscription patient
router.post("/patient/register", registerPatient);

/* US4 : Connexion patient
router.post("/patient/login", loginPatient);

// ── Médecin ──────────────────────────────────────────────────────────────────
// US5 : Connexion médecin
router.post("/medecin/login", loginMedecin);
*/

// ── Session ──────────────────────────────────────────────────────────────────
// Récupérer l'utilisateur connecté (token requis)
router.get("/me", proteger, getMe);

router.post("/login", login); 
// Déconnexion
router.post("/logout", proteger, logout);



module.exports = router;



