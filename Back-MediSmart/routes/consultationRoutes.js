// ============================================================
//  routes/consultationRoutes.js
// ============================================================
const express                    = require('express');
const router                     = express.Router();
const { proteger, autoriserRole } = require('../middleware/authMiddleware');
const consultationController     = require('../presentation/consultationController');

const medecinAuth = [proteger, autoriserRole('medecin')];

// GET /api/consultations/today-queue
// File fusionnée du jour : RDV + Tickets intercalés par heure
router.get('/today-queue', medecinAuth, consultationController.getTodayQueue);

// POST /api/consultations/notes
// Sauvegarder les notes de consultation dans DOSSIERS_MEDICAUX
router.post('/notes', medecinAuth, consultationController.sauvegarderNotes);

module.exports = router;