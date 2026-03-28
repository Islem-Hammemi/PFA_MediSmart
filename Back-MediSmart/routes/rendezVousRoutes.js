// =============================================
// routes/rendezVousRoutes.js
// =============================================
const express = require("express");
const router  = express.Router();

const ctrl               = require("../presentation/rendezVousController");
const { proteger, autoriserRole } = require("../middleware/authMiddleware");

// Toutes les routes nécessitent un patient authentifié
// (même pattern que ton authMiddleware existant)
const patientAuth = [proteger, autoriserRole("patient")];

// ── GET ──────────────────────────────────────────────────────
//  Les routes statiques AVANT /:id pour éviter les conflits
router.get("/upcoming",             patientAuth, ctrl.getUpcoming);
router.get("/past",                 patientAuth, ctrl.getPast);
router.get("/evaluation-pending",   patientAuth, ctrl.getEvaluationEnAttente);
router.get("/:id",                  patientAuth, ctrl.getOne);

// ── POST ─────────────────────────────────────────────────────
// Body attendu : { medecinId: int, dateHeure: "YYYY-MM-DD HH:MM:SS", motif?: string }
router.post("/",                    patientAuth, ctrl.reserver);

// ── PATCH ────────────────────────────────────────────────────
router.patch("/:id/annuler",        patientAuth, ctrl.annuler);

module.exports = router;