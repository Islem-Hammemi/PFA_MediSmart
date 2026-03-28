// ============================================================
//  evaluationRoutes.js  –  Couche Routes
//  Sprint 2 – US11 : Évaluation par rendez-vous
//  Responsable : Sarra Othmani
// ============================================================

const express              = require('express');
const router               = express.Router();
const evaluationController = require('../presentation/evaluationController');
const { protegerTicketRDV } = require('../middleware/authMiddleware');

// US11 : Évaluer un médecin après un rendez-vous terminé
router.post('/', protegerTicketRDV, evaluationController.evaluerMedecin);

module.exports = router;