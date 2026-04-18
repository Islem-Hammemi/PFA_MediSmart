// ============================================================
//  presentation/ticketController.js
// ============================================================
const ticketService  = require('../business/ticketService');
const { sendError }  = require('../middleware/errorHandler');

const ticketController = {

  async genererTicket(req, res) {
    try {
      const { medecin_id } = req.body;
      if (!medecin_id || isNaN(Number(medecin_id)))
        return res.status(400).json({ success: false, message: "Please select a valid doctor." });
      const ticket = await ticketService.genererTicket(req.utilisateur.user_id, Number(medecin_id));
      return res.status(201).json({ success: true, message: "Ticket generated successfully.", ticket });
    } catch (err) { return sendError(res, err); }
  },

  async consulterTickets(req, res) {
    try {
      const tickets = await ticketService.consulterTickets(req.utilisateur.patient_id);
      return res.status(200).json({ success: true, count: tickets.length, tickets });
    } catch (err) { return sendError(res, err); }
  },

  async getQueueStatus(req, res) {
    try {
      const { medecin_id } = req.params;
      if (!medecin_id || isNaN(Number(medecin_id)))
        return res.status(400).json({ success: false, message: "Invalid doctor ID." });
      const data = await ticketService.getQueueStatus(Number(medecin_id));
      return res.status(200).json({
        success: true,
        data: {
          total_queue:      Number(data.total_queue)      || 0,
          serving_position: Number(data.serving_position) || 1,
          next_position:    Number(data.next_position)    || 1,
          avgConsultationTime: Number(data.avgConsultationTime) || 4,
        },
      });
    } catch (err) { return sendError(res, err); }
  },

  async serveTicket(req, res) {
    try {
      const ticket_id  = Number(req.params.id);
      const medecin_id = req.utilisateur.medecin_id;
      if (!medecin_id)
        return res.status(403).json({ success: false, message: "Access reserved for doctors." });
      if (!ticket_id || isNaN(ticket_id))
        return res.status(400).json({ success: false, message: "Invalid ticket ID." });
      const ticket = await ticketService.serveTicket(ticket_id, medecin_id);
      return res.status(200).json({ success: true, message: "Patient is now in consultation.", ticket });
    } catch (err) { return sendError(res, err); }
  },

  async doneTicket(req, res) {
    try {
      const ticket_id  = Number(req.params.id);
      const medecin_id = req.utilisateur.medecin_id;
      if (!medecin_id)
        return res.status(403).json({ success: false, message: "Access reserved for doctors." });
      if (!ticket_id || isNaN(ticket_id))
        return res.status(400).json({ success: false, message: "Invalid ticket ID." });
      const ticket = await ticketService.doneTicket(ticket_id, medecin_id);
      return res.status(200).json({ success: true, message: "Consultation completed.", ticket });
    } catch (err) { return sendError(res, err); }
  },

  async getTodayQueue(req, res) {
    try {
      const medecin_id = req.utilisateur.medecin_id;
      if (!medecin_id)
        return res.status(403).json({ success: false, message: "Access reserved for doctors." });
      const queue = await ticketService.getTodayQueue(medecin_id);
      return res.status(200).json({ success: true, count: queue.length, queue });
    } catch (err) { return sendError(res, err); }
  },

  async getMyActiveStatus(req, res) {
    try {
      const patientId = req.utilisateur.patient_id;
      if (!patientId)
        return res.status(403).json({ success: false, message: "Access denied." });

      const db = require('../config/db');

      const [tickets] = await db.query(
        `SELECT t.id, t.statut, t.numero, t.position, t.medecin_id,
                CONCAT(u.prenom, ' ', u.nom) AS medecin_nom,
                m.specialite
         FROM TICKETS t
         JOIN MEDECINS m ON m.id = t.medecin_id
         JOIN USERS    u ON u.id = m.user_id
         WHERE t.patient_id = ?
           AND DATE(t.created_at) = CURDATE()
         ORDER BY t.created_at DESC LIMIT 1`,
        [patientId]
      );

      const [rdvs] = await db.query(
        `SELECT r.id AS rdv_id, r.statut, r.medecin_id, r.evaluation_demandee,
                CONCAT(u.prenom, ' ', u.nom) AS medecin_nom,
                m.specialite
         FROM RENDEZ_VOUS r
         JOIN MEDECINS m ON m.id = r.medecin_id
         JOIN USERS    u ON u.id = m.user_id
         WHERE r.patient_id = ?
           AND DATE(r.date_heure) = CURDATE()
         ORDER BY r.date_heure DESC LIMIT 1`,
        [patientId]
      );

      const ticket = tickets[0] || null;
      const rdv    = rdvs[0]    || null;

      let needsEvaluation = false;
      let evaluationData  = null;

      if (ticket?.statut === 'termine') {
        const [existing] = await db.query(
          `SELECT id FROM EVALUATIONS WHERE ticket_id = ? LIMIT 1`, [ticket.id]
        );
        if (!existing[0]) {
          needsEvaluation = true;
          evaluationData  = {
            source: 'ticket', ticket_id: ticket.id,
            medecin_id: ticket.medecin_id, medecin_nom: ticket.medecin_nom,
            specialite: ticket.specialite, rdv_id: null,
          };
        }
      }

      if (!needsEvaluation && rdv?.evaluation_demandee && rdv?.statut === 'termine') {
        const [existing] = await db.query(
          `SELECT id FROM EVALUATIONS WHERE rendez_vous_id = ? LIMIT 1`, [rdv.rdv_id]
        );
        if (!existing[0]) {
          needsEvaluation = true;
          evaluationData  = {
            source: 'rdv', medecin_id: rdv.medecin_id,
            medecin_nom: rdv.medecin_nom, specialite: rdv.specialite,
            rdv_id: rdv.rdv_id,
          };
        }
      }

      return res.json({ success: true, ticket, rdv, needsEvaluation, evaluationData });
    } catch (err) { return sendError(res, err); }
  },
};

module.exports = ticketController;