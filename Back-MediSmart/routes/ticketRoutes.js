const express          = require('express');
const router           = express.Router();
const ticketController = require('../presentation/ticketController');
const { proteger, autoriserRole } = require('../middleware/authMiddleware');

const patientAuth = [proteger, autoriserRole('patient')];
const medecinAuth = [proteger, autoriserRole('medecin')];

// US8 : Générer un ticket numérique
router.post('/', patientAuth, ticketController.genererTicket);

// US9 : Consulter ses tickets
router.get('/patient', patientAuth, ticketController.consulterTickets);

// Public — no auth needed to view queue
router.get('/queue/:medecin_id', ticketController.getQueueStatus);

// Médecin — passer un ticket en cours
router.patch('/:id/serve', medecinAuth, ticketController.serveTicket);
router.patch('/:id/done',  medecinAuth, ticketController.doneTicket);

module.exports = router;