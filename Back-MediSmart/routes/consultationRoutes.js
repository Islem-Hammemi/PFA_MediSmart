// ============================================================
//  routes/consultationRoutes.js  — COMPLETE
// ============================================================
const express                     = require('express');
const router                      = express.Router();
const { proteger, autoriserRole } = require('../middleware/authMiddleware');
const ctrl                        = require('../presentation/consultationController');

const medecinAuth = [proteger, autoriserRole('medecin')];

// GET  /api/consultations/today-queue  — merged queue (tickets + RDV) for today
router.get('/today-queue', medecinAuth, ctrl.getTodayQueue);

// PATCH /api/consultations/serve/:id   — mark patient as en_cours
// Body: { type: "ticket" | "rdv" }
router.patch('/serve/:id', medecinAuth, ctrl.servePatient);

// PATCH /api/consultations/finish/:id  — mark as done + save notes
// Body: { type: "ticket" | "rdv", notes?, patientId? }
router.patch('/finish/:id', medecinAuth, ctrl.finishPatient);

// POST  /api/consultations/notes       — save detailed notes (diagnostic/traitement)
router.post('/notes', medecinAuth, ctrl.sauvegarderNotes);

module.exports = router;