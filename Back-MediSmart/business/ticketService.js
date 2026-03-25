// ============================================================
//  ticketService.js  –  Couche Métier (Business/Service)
//  Sprint 2 – US8 + US9 : Génération et consultation de ticket numérique
//  Responsable : Sarra Othmani
// ============================================================

const ticketRepository = require('../repository/ticketRepository');

const ticketService = {

  // Génère un ticket numérique pour un patient authentifié.
   
  async genererTicket(user_id, medecin_id) {

    // ── 1. Vérifier que le médecin existe ──────────────────────
    const medecin = await ticketRepository.getMedecinById(medecin_id);
    if (!medecin) {
      const err = new Error('Médecin introuvable.');
      err.statusCode = 404;
      throw err;
    }

    // ── 2. Vérifier que le médecin n'est pas absent ────────────
    if (medecin.statut === 'absent') {
      const err = new Error(
        `Dr. ${medecin.nom} est actuellement absent. Veuillez choisir un autre médecin.`
      );
      err.statusCode = 409;
      throw err;
    }

    // ── 3. Récupérer le profil patient ─────────────────────────
    const patient = await ticketRepository.getPatientByUserId(user_id);
    if (!patient) {
      const err = new Error('Profil patient introuvable pour cet utilisateur.');
      err.statusCode = 404;
      throw err;
    }

    // ── 4. Calculer le prochain numéro et position ─────────────
    const [numero, position] = await Promise.all([
      ticketRepository.getNextNumero(medecin_id),
      ticketRepository.getNextPosition(medecin_id),
    ]);

    // ── 5. Créer le ticket en base ─────────────────────────────
    const newTicketId = await ticketRepository.createTicket({
      patient_id: patient.id,
      medecin_id,
      numero,
      position,
    });

    // ── 6. Récupérer et retourner les détails complets ─────────
    const ticket = await ticketRepository.getTicketById(newTicketId);
    return ticket;
  },


  //Retourne la liste des tickets du patient connecté.
   
  async consulterTickets(patient_id) {
    const tickets = await ticketRepository.getTicketsByPatientId(patient_id);
    return tickets;
  },

  //zedtha
  async getQueueStatus(medecin_id) {
  return await ticketRepository.getQueueStatus(medecin_id);
},

};

module.exports = ticketService;