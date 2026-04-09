// ============================================================
//  ticketService.js  –  Couche Métier (Business/Service)
//  Sprint 2 – US8 + US9 : Génération et consultation de ticket numérique
//  Responsable : Sarra Othmani
// ============================================================

const ticketRepository = require('../repository/ticketRepository');

const ticketService = {

  async genererTicket(user_id, medecin_id) {

    const medecin = await ticketRepository.getMedecinById(medecin_id);
    if (!medecin) {
      const err = new Error('Médecin introuvable.');
      err.statusCode = 404;
      throw err;
    }

    if (medecin.statut === 'absent') {
      const err = new Error(
        `Dr. ${medecin.nom} est actuellement absent. Veuillez choisir un autre médecin.`
      );
      err.statusCode = 409;
      throw err;
    }

    const patient = await ticketRepository.getPatientByUserId(user_id);
    if (!patient) {
      const err = new Error('Profil patient introuvable pour cet utilisateur.');
      err.statusCode = 404;
      throw err;
    }

    const [numero, position] = await Promise.all([
      ticketRepository.getNextNumero(medecin_id),
      ticketRepository.getNextPosition(medecin_id),
    ]);

    const newTicketId = await ticketRepository.createTicket({
      patient_id: patient.id,
      medecin_id,
      numero,
      position,
    });

    const ticket = await ticketRepository.getTicketById(newTicketId);
    return ticket;
  },

  async consulterTickets(patient_id) {
    return await ticketRepository.getTicketsByPatientId(patient_id);
  },

  async getQueueStatus(medecin_id) {
    return await ticketRepository.getQueueStatus(medecin_id);
  },

  async serveTicket(ticket_id, medecin_id) {
    if (!ticket_id || !medecin_id) {
      const err = new Error('ticket_id et medecin_id sont requis.');
      err.statusCode = 400;
      throw err;
    }
    const ticket = await ticketRepository.serveTicket(ticket_id, medecin_id);
    if (!ticket) {
      const err = new Error('Ticket introuvable, déjà en cours, ou accès refusé.');
      err.statusCode = 404;
      throw err;
    }
    return ticket;
  },

  async doneTicket(ticket_id, medecin_id) {
    if (!ticket_id || !medecin_id) {
      const err = new Error('ticket_id et medecin_id sont requis.');
      err.statusCode = 400;
      throw err;
    }
    const ticket = await ticketRepository.doneTicket(ticket_id, medecin_id);
    if (!ticket) {
      const err = new Error('Ticket introuvable, pas en cours, ou accès refusé.');
      err.statusCode = 404;
      throw err;
    }
    return ticket;
  },

  async getTodayQueue(medecin_id) {
    if (!medecin_id) {
      const err = new Error('medecin_id requis.');
      err.statusCode = 400;
      throw err;
    }
    return await ticketRepository.getTodayQueueByMedecin(medecin_id);
  },

};

module.exports = ticketService;