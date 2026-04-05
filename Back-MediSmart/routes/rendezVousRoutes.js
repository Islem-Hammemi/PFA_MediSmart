const express = require("express");
const router  = express.Router();

const ctrl                       = require("../presentation/rendezVousController");
const { proteger, autoriserRole } = require("../middleware/authMiddleware");

// ── Shorthands middleware ─────────────────────────────────────
const patientAuth = [proteger, autoriserRole("patient")];
const medecinAuth = [proteger, autoriserRole("medecin")];

// ============================================================
// ROUTES PATIENT 
// ============================================================

// GET  /api/rendez-vous/upcoming
router.get("/upcoming",           patientAuth, ctrl.getUpcoming);

// GET  /api/rendez-vous/past
router.get("/past",               patientAuth, ctrl.getPast);

// GET  /api/rendez-vous/evaluation-pending
router.get("/evaluation-pending", patientAuth, ctrl.getEvaluationEnAttente);

// POST /api/rendez-vous  ← ancien mode (medecinId + dateHeure direct)
router.post("/",                  patientAuth, ctrl.reserver);

// PATCH /api/rendez-vous/:id/annuler
router.patch("/:id/annuler",      patientAuth, ctrl.annuler);

// GET  /api/rendez-vous/:id  ← DOIT rester après les routes statiques
router.get("/:id",                patientAuth, ctrl.getOne);



// ── Créneaux ─────────────────────────────────────────────────
// GET /api/rendez-vous/creneaux/:medecinId
// US17 – créneaux disponibles d'un médecin (patient authentifié)
router.get("/creneaux/:medecinId", patientAuth, ctrl.getCreneaux);

// ── Prise RDV via créneau ────────────────────────────────────
// POST /api/rendez-vous/creneau
// US18 – réserver via créneau avec validation + transaction
// Body : { medecinId: int, creneauId: int, motif?: string }
router.post("/creneau",            patientAuth, ctrl.reserverViaCreneau);

// ── Planning médecin ─────────────────────────────────────────
// GET /api/rendez-vous/medecin/planning
// US13 – planning complet du médecin connecté
router.get("/medecin/planning",    medecinAuth, ctrl.getPlanningMedecin);

// GET /api/rendez-vous/medecin/upcoming
// US19 – prochains RDV du médecin connecté
router.get("/medecin/upcoming",    medecinAuth, ctrl.getUpcomingMedecin);

module.exports = router;