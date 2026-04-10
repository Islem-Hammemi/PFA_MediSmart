const express          = require('express');
const router           = express.Router();
const ticketController = require('../presentation/ticketController');
const { proteger, autoriserRole } = require('../middleware/authMiddleware');

const patientAuth = [proteger, autoriserRole('patient')];
const medecinAuth = [proteger, autoriserRole('medecin')];

// US8 : Générer un ticket numérique
router.post('/', patientAuth, ticketController.genererTicket);

// US9 : Consulter ses tickets (patient)
router.get('/patient', patientAuth, ticketController.consulterTickets);

// File d'attente du jour (médecin) — doit être AVANT /:id
router.get('/today', medecinAuth, ticketController.getTodayQueue);

// Public — état de la file
router.get('/queue/:medecin_id', ticketController.getQueueStatus);

// Médecin — actions sur un ticket
router.patch('/:id/serve', medecinAuth, ticketController.serveTicket);
router.patch('/:id/done',  medecinAuth, ticketController.doneTicket);

module.exports = router;