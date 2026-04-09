// ============================================================
//  evaluationRoutes.js  –  Couche Routes
//  Sprint 2 – US11 : Évaluation par rendez-vous
//  Sprint 3 – GET évaluations médecin (dashboard)
//  Responsable : Sarra Othmani
// ============================================================

const express              = require('express');
const router               = express.Router();
const evaluationController = require('../presentation/evaluationController');
const { protegerTicketRDV } = require('../middleware/authMiddleware');

// ── Route publique — AVANT /:id pour éviter les conflits ─────
// Sprint 3 : Reviews du dashboard médecin
// GET /api/evaluations/medecin/:medecin_id?limit=3
router.get('/medecin/:medecin_id', evaluationController.getEvaluationsMedecin);

// ── Route protégée patient ────────────────────────────────────
// US11 : Évaluer un médecin après un rendez-vous terminé
router.post('/', protegerTicketRDV, evaluationController.evaluerMedecin);

module.exports = router;