// ============================================================
//  ticketController.js  –  Couche Présentation (Controller)
//  Sprint 2 – US8 : Génération de ticket numérique
//  Responsable : Sarra Othmani
// ============================================================

const ticketService = require('../business/ticketService');

const ticketController = {

  // POST /api/tickets
  async genererTicket(req, res) {
    try {
      const { medecin_id } = req.body;

      if (!medecin_id || isNaN(Number(medecin_id))) {
        return res.status(400).json({
          success: false,
          message: 'Le champ medecin_id est requis et doit être un nombre.',
        });
      }

      const ticket = await ticketService.genererTicket(
        req.utilisateur.user_id,
        Number(medecin_id)
      );

      return res.status(201).json({
        success: true,
        message: 'Ticket généré avec succès.',
        ticket,
      });

    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message,
        });
      }
      console.error('[ticketController.genererTicket]', err);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.',
      });
    }
  },

  // GET /api/tickets/patient
  async consulterTickets(req, res) {
    try {
      const tickets = await ticketService.consulterTickets(
        req.utilisateur.patient_id
      );

      return res.status(200).json({
        success: true,
        count: tickets.length,
        tickets,
      });

    } catch (err) {
      console.error('[ticketController.consulterTickets]', err);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.',
      });
    }
  },

  // GET /api/tickets/queue/:medecin_id (public)
  async getQueueStatus(req, res) {
    try {
      const { medecin_id } = req.params;

      if (!medecin_id || isNaN(Number(medecin_id))) {
        return res.status(400).json({
          success: false,
          message: 'medecin_id invalide.',
        });
      }

      const data = await ticketService.getQueueStatus(Number(medecin_id));

      return res.status(200).json({
        success: true,
        data: {
          total_queue:      Number(data.total_queue)      || 0,
          serving_position: Number(data.serving_position) || 1,
          next_position:    Number(data.next_position)    || 1,
        },
      });

    } catch (err) {
      console.error('[ticketController.getQueueStatus]', err);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.',
      });
    }
  },

  // PATCH /api/tickets/:id/serve
  async serveTicket(req, res) {
    try {
      const ticket_id  = Number(req.params.id);
      const medecin_id = req.utilisateur.medecin_id;

      if (!medecin_id) {
        return res.status(403).json({
          success: false,
          message: 'Accès réservé aux médecins.',
        });
      }

      if (!ticket_id || isNaN(ticket_id)) {
        return res.status(400).json({
          success: false,
          message: 'ticket_id invalide.',
        });
      }

      const ticket = await ticketService.serveTicket(ticket_id, medecin_id);

      return res.status(200).json({
        success: true,
        message: 'Ticket passé en cours ✅',
        ticket,
      });

    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message,
        });
      }
      console.error('[ticketController.serveTicket]', err);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.',
      });
    }
  },

  async doneTicket(req, res) {
  try {
    const ticket_id  = Number(req.params.id);
    const medecin_id = req.utilisateur.medecin_id;

    if (!medecin_id) {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux médecins.',
      });
    }
    if (!ticket_id || isNaN(ticket_id)) {
      return res.status(400).json({
        success: false,
        message: 'ticket_id invalide.',
      });
    }

    const ticket = await ticketService.doneTicket(ticket_id, medecin_id);
    return res.status(200).json({
      success: true,
      message: 'Consultation terminée.',
      ticket,
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }
    console.error('[ticketController.doneTicket]', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.',
    });
  }
},


};

module.exports = ticketController;