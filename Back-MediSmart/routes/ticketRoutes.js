const express        = require('express');
const router         = express.Router();
const ticketController = require('../presentation/ticketController');
const { protegerTicketRDV } = require('../middleware/authMiddleware'); // ← destructuring


// US8 : Générer un ticket numérique
router.post('/', protegerTicketRDV, ticketController.genererTicket);

// US9 : Consulter ses tickets
router.get('/patient', protegerTicketRDV, ticketController.consulterTickets);

module.exports = router;