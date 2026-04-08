// =============================================
// routes/rendezVousRoutes.js  — VERSION FINALE SPRINT 3
// =============================================
const express = require("express");
const router  = express.Router();
const ctrl    = require("../presentation/rendezVousController");
const { proteger, autoriserRole } = require("../middleware/authMiddleware");

const patientAuth = [proteger, autoriserRole("patient")];
const medecinAuth = [proteger, autoriserRole("medecin")];

// ── Patient ───────────────────────────────────────────────────
router.get("/upcoming",           patientAuth, ctrl.getUpcoming);
router.get("/past",               patientAuth, ctrl.getPast);
router.get("/evaluation-pending", patientAuth, ctrl.getEvaluationEnAttente);
router.post("/",                  patientAuth, ctrl.reserver);
router.patch("/:id/annuler",      patientAuth, ctrl.annuler);

// ── Créneaux ─────────────────────────────────────────────────
router.get("/creneaux/:medecinId", patientAuth, ctrl.getCreneaux);
router.post("/creneau",            patientAuth, ctrl.reserverViaCreneau);

// ── Médecin – Planning ───────────────────────────────────────
router.get("/medecin/planning",   medecinAuth, ctrl.getPlanningMedecin);
router.get("/medecin/upcoming",   medecinAuth, ctrl.getUpcomingMedecin);

// ─── [NOUVEAU] Médecin – Pending Requests ────────────────────
router.get("/medecin/pending",    medecinAuth, ctrl.getPendingMedecin);

// ─── [NOUVEAU] Médecin – Actions sur RDV ─────────────────────
router.patch("/:id/confirmer",    medecinAuth, ctrl.confirmer);
router.patch("/:id/refuser",      medecinAuth, ctrl.refuser);
router.patch("/:id/terminer",     medecinAuth, ctrl.terminer);

// ── Patient – détail (doit rester en dernier) ─────────────────
router.get("/:id",                patientAuth, ctrl.getOne);

module.exports = router;