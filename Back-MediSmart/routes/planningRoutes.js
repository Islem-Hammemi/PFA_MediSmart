// ============================================================
//  planningRoutes.js  –  Couche Routes
//  Sprint 3 – US13 : Planning médecin
//  Responsable : Sarra Othmani
// ============================================================

const express             = require('express');
const router              = express.Router();
const planningController  = require('../presentation/planningController');
const { proteger, autoriserRole } = require('../middleware/authMiddleware');

// Middleware : authentifié + rôle médecin uniquement
const protegerMedecin = [proteger, autoriserRole('medecin')];

// US13 : Récupérer le planning complet du médecin connecté
router.get('/medecin', protegerMedecin, planningController.getPlanning);

module.exports = router;