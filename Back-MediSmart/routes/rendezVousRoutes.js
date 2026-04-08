// =============================================
// routes/rendezVousRoutes.js  — VERSION FINALE SPRINT 3
// =============================================
const express = require("express");
const router  = express.Router();
const ctrl    = require("../presentation/rendezVousController");
const { proteger, autoriserRole } = require("../middleware/authMiddleware");

const patientAuth = [proteger, autoriserRole("patient")];
const medecinAuth = [proteger, autoriserRole("medecin")];

// ============================================================
// ROUTES PATIENT
// ============================================================
router.get("/upcoming",            patientAuth, ctrl.getUpcoming);
router.get("/past",                patientAuth, ctrl.getPast);
router.get("/evaluation-pending",  patientAuth, ctrl.getEvaluationEnAttente);
router.post("/",                   patientAuth, ctrl.reserver);
router.patch("/:id/annuler",       patientAuth, ctrl.annuler);
router.get("/creneaux/:medecinId", patientAuth, ctrl.getCreneaux);
router.post("/creneau",            patientAuth, ctrl.reserverViaCreneau);
router.get("/:id",                 patientAuth, ctrl.getOne);

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

// ✅ NOUVEAU : médecin crée un RDV pour un patient
// POST /api/rendez-vous/medecin/reserver
// Body : { patientId, dateHeure, motif?, statut? }
router.post("/medecin/reserver",   medecinAuth, ctrl.reserverParMedecin);

module.exports = router;