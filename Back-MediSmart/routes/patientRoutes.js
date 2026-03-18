const express    = require('express');
const router     = express.Router();
const { proteger, autoriserRole } = require('../middleware/authMiddleware'); // ← noms corrects
const patientController = require('../presentation/patientController');

// US9  – GET  /api/tickets/patient
router.get('/tickets/patient',  proteger, autoriserRole('patient'), patientController.getMyTickets);

// US10 – GET  /api/dossiers/patient
router.get('/dossiers/patient', proteger, autoriserRole('patient'), patientController.getMyDossiers);

// US12 – POST /api/logout
router.post('/logout',          proteger, patientController.logout);

module.exports = router;