// =============================================
// routes/patientRoutes.js
// =============================================
const express    = require('express');
const router     = express.Router();
const { proteger, autoriserRole } = require('../middleware/authMiddleware');
const patientController = require('../presentation/patientController');

const patient = [proteger, autoriserRole('patient')]; // shorthand

// ── Existantes ────────────────────────────────────────────────
// US9  – GET  /api/tickets/patient
router.get('/tickets/patient',  ...patient, patientController.getMyTickets);

// US10 – GET  /api/dossiers/patient
router.get('/dossiers/patient', ...patient, patientController.getMyDossiers);

// US12 – POST /api/logout
router.post('/logout', proteger, patientController.logout);

// ── NOUVEAU : Dashboard ───────────────────────────────────────
// GET /api/patient/dashboard/stats
router.get('/patient/dashboard/stats',            ...patient, patientController.getDashboardStats);

// GET /api/patient/dashboard/next-appointment
router.get('/patient/dashboard/next-appointment', ...patient, patientController.getNextAppointment);

module.exports = router;