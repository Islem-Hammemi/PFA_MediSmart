// ============================================================
//  ticketController.js  –  Couche Présentation (Controller)
//  Sprint 2 – US8 : Génération de ticket numérique
//  Responsable : Sarra Othmani
// ============================================================

const ticketService = require('../business/ticketService');

const ticketController = {

  /* POST /tickets : 
      Génère un ticket numérique pour le patient connecté.*/

  async genererTicket(req, res) {
    try {
      // ──  Vérifier que le patient est authentifié ───────────
      if (!req.user || req.user.role !== 'patient') {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé. Seuls les patients peuvent générer un ticket.',
        });
      }

      // ──  Valider le body ───────────────────────────────────
      const { medecin_id } = req.body;

      if (!medecin_id || isNaN(Number(medecin_id))) {
        return res.status(400).json({
          success: false,
          message: 'Le champ medecin_id est requis et doit être un nombre.',
        });
      }

      // ──  Déléguer la logique métier au service ─────────────
      const ticket = await ticketService.genererTicket(
        req.user.id,
        Number(medecin_id)
      );

      // ──  Réponse de confirmation ───────────────────────────
      return res.status(201).json({
        success: true,
        message: 'Ticket généré avec succès.',
        ticket,
      });

    } catch (err) {
      // Erreurs métier levées depuis ticketService
      if (err.statusCode) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message,
        });
      }

      // Erreur technique inattendue
      console.error('[ticketController.genererTicket]', err);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.',
      });
    }
  },

  /* GET /tickets/patient : 
      Retourne tous les tickets du patient connecté.*/
   
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

};

module.exports = ticketController;