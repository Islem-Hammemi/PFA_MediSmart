// ============================================================
//  ticketRepository.js  –  Couche Accès aux Données (Repository)
//  Sprint 2 – US8 : Génération de ticket numérique
//  Responsable : Sarra Othmani
// ============================================================

const db = require('../config/db');

const ticketRepository = {

  // Récupère le prochain numéro de ticket disponible pour un médecin donné.
  async getNextNumero(medecin_id) {
    const [rows] = await db.query(
      `SELECT COALESCE(MAX(numero), 0) + 1 AS next_numero
       FROM TICKETS
       WHERE medecin_id = ?
         AND statut IN ('en_attente', 'en_cours')`,
      [medecin_id]
    );
    return rows[0].next_numero;
  },

  // Récupère la prochaine position disponible dans la file d'attente.
  async getNextPosition(medecin_id) {
    const [rows] = await db.query(
      `SELECT COALESCE(MAX(position), 0) + 1 AS next_position
       FROM TICKETS
       WHERE medecin_id = ?
         AND statut IN ('en_attente', 'en_cours')`,
      [medecin_id]
    );
    return rows[0].next_position;
  },

  // Crée un nouveau ticket en base.
  async createTicket({ patient_id, medecin_id, numero, position }) {
    const [result] = await db.query(
      `INSERT INTO TICKETS (patient_id, medecin_id, numero, position, statut)
       VALUES (?, ?, ?, ?, 'en_attente')`,
      [patient_id, medecin_id, numero, position]
    );
    return result.insertId;
  },

  // Récupère les détails complets d'un ticket (avec infos médecin).
  async getTicketById(ticket_id) {
    const [rows] = await db.query(
      `SELECT
         t.id,
         t.numero,
         t.position,
         t.statut,
         t.medecin_id,
         DATE_FORMAT(t.created_at, '%d/%m/%Y à %H:%i') AS date_creation,
         CONCAT(um.prenom, ' ', um.nom) AS medecin_nom,
         m.specialite
       FROM TICKETS t
       JOIN MEDECINS m  ON m.id  = t.medecin_id
       JOIN USERS    um ON um.id = m.user_id
       WHERE t.id = ?`,
      [ticket_id]
    );
    return rows[0] || null;
  },

  // Vérifie si le médecin existe et récupère son statut.
  async getMedecinById(medecin_id) {
    const [rows] = await db.query(
      `SELECT m.id, m.statut, CONCAT(u.prenom, ' ', u.nom) AS nom, m.specialite
       FROM MEDECINS m
       JOIN USERS u ON u.id = m.user_id
       WHERE m.id = ?`,
      [medecin_id]
    );
    return rows[0] || null;
  },

  // Récupère le profil patient depuis user_id.
  async getPatientByUserId(user_id) {
    const [rows] = await db.query(
      `SELECT p.id, p.user_id
       FROM PATIENTS p
       WHERE p.user_id = ?
       LIMIT 1`,
      [user_id]
    );
    return rows[0] || null;
  },

  // Retourne tous les tickets d'un patient avec les infos du médecin.
  async getTicketsByPatientId(patient_id) {
    const [rows] = await db.query(
      `SELECT
         t.id,
         t.numero,
         t.position,
         t.statut,
         t.medecin_id,                                           -- ✅ ajouté
         DATE_FORMAT(t.created_at, '%d/%m/%Y à %H:%i') AS date_creation,
         DATE_FORMAT(t.updated_at, '%d/%m/%Y à %H:%i') AS derniere_maj,
         CONCAT(um.prenom, ' ', um.nom) AS medecin_nom,
         m.specialite
       FROM TICKETS t
       JOIN MEDECINS m  ON m.id  = t.medecin_id
       JOIN USERS    um ON um.id = m.user_id
       WHERE t.patient_id = ?
       ORDER BY t.created_at DESC`,
      [patient_id]
    );
    return rows;
  },

  // Statut en temps réel de la file d'attente d'un médecin.
  async getQueueStatus(medecin_id) {
    const [rows] = await db.query(
      `SELECT
         COUNT(*)                                                    AS total_queue,
         MIN(CASE WHEN statut = 'en_cours' THEN position END)       AS serving_position,
         MIN(CASE WHEN statut = 'en_attente' THEN position END)     AS next_position
       FROM TICKETS
       WHERE medecin_id = ?
         AND statut IN ('en_attente', 'en_cours')`,
      [medecin_id]
    );
    return rows[0];
  },

};

module.exports = ticketRepository;