// ============================================================
//  routes/consultationRoutes.js
//  Ajouter dans app.js : app.use('/api/consultations', consultationRoutes);
// ============================================================

const express = require('express');
const router  = express.Router();
const { proteger, autoriserRole } = require('../middleware/authMiddleware');
const { getTodayQueue } = require('../presentation/consultationController');

const medecinAuth = [proteger, autoriserRole('medecin')];

// GET /api/consultations/today-queue
// Retourne la file fusionnée du jour : RDV + Tickets, triés par heure
router.get('/today-queue', medecinAuth, getTodayQueue);

module.exports = router;