const express          = require('express');
const router           = express.Router();
const ticketController = require('../presentation/ticketController');
const { proteger, autoriserRole, protegerTicketRDV } = require('../middleware/authMiddleware');

const patientAuth = [proteger, autoriserRole('patient')];
const medecinAuth = [proteger, autoriserRole('medecin')];

// ── Static routes FIRST (before any /:id) ────────────────────

// US8 : Générer un ticket numérique
router.post('/', patientAuth, ticketController.genererTicket);

// US9 : Consulter ses tickets (patient)
router.get('/patient', patientAuth, ticketController.consulterTickets);

//  MUST be here — before /:id routes
router.get('/my-active-status', protegerTicketRDV, ticketController.getMyActiveStatus);

// File d'attente du jour (médecin)
router.get('/today', medecinAuth, ticketController.getTodayQueue);

// Public — état de la file
router.get('/queue/:medecin_id', ticketController.getQueueStatus);

// ── Dynamic /:id routes LAST ──────────────────────────────────
router.patch('/:id/serve', medecinAuth, ticketController.serveTicket);
router.patch('/:id/done',  medecinAuth, ticketController.doneTicket);

module.exports = router;