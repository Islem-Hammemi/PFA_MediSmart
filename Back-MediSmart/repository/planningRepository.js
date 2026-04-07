// ============================================================
//  planningRepository.js  –  Couche Accès aux Données
//  Sprint 3 – US13 : Planning médecin
//  Responsable : Sarra Othmani
// ============================================================

const db = require('../config/db');

const planningRepository = {

  /**
   * Récupère le profil médecin à partir du user_id (session).
   */
  async getMedecinByUserId(user_id) {
    const [rows] = await db.query(
      `SELECT m.id AS medecin_id, m.specialite, m.statut,
              m.note_moyenne, m.nb_evaluations,
              u.nom, u.prenom, u.email
       FROM MEDECINS m
       JOIN USERS u ON u.id = m.user_id
       WHERE m.user_id = ?`,
      [user_id]
    );
    return rows[0] || null;
  },

  /**
   * Récupère les RDV à venir du médecin (upcoming).
   * Statut : planifie ou confirme
   * Triés par date croissante
   */
  async getUpcomingRDV(medecin_id) {
    const [rows] = await db.query(
      `SELECT
         r.id,
         r.statut,
         r.motif,
         DATE_FORMAT(r.date_heure, '%d/%m/%Y')    AS date,
         DATE_FORMAT(r.date_heure, '%H:%i')        AS heure,
         DATE_FORMAT(r.date_heure, '%d/%m/%Y à %H:%i') AS date_heure_formatee,
         CONCAT(up.prenom, ' ', up.nom)            AS patient_nom,
         p.telephone                                AS patient_telephone,
         r.evaluation_demandee
       FROM RENDEZ_VOUS r
       JOIN PATIENTS pa ON pa.id = r.patient_id
       JOIN USERS    up ON up.id = pa.user_id
       JOIN PATIENTS p  ON p.id  = r.patient_id
       WHERE r.medecin_id = ?
         AND r.statut IN ('planifie', 'confirme')
         AND r.date_heure >= NOW()
       ORDER BY r.date_heure ASC`,
      [medecin_id]
    );
    return rows;
  },

  /**
   * Récupère les RDV passés du médecin (past).
   * Statut : termine ou annule
   * Triés par date décroissante
   */
  async getPastRDV(medecin_id) {
    const [rows] = await db.query(
      `SELECT
         r.id,
         r.statut,
         r.motif,
         DATE_FORMAT(r.date_heure, '%d/%m/%Y')    AS date,
         DATE_FORMAT(r.date_heure, '%H:%i')        AS heure,
         DATE_FORMAT(r.date_heure, '%d/%m/%Y à %H:%i') AS date_heure_formatee,
         CONCAT(up.prenom, ' ', up.nom)            AS patient_nom,
         p.telephone                                AS patient_telephone,
         r.evaluation_demandee
       FROM RENDEZ_VOUS r
       JOIN PATIENTS pa ON pa.id = r.patient_id
       JOIN USERS    up ON up.id = pa.user_id
       JOIN PATIENTS p  ON p.id  = r.patient_id
       WHERE r.medecin_id = ?
         AND r.statut IN ('termine', 'annule')
       ORDER BY r.date_heure DESC`,
      [medecin_id]
    );
    return rows;
  },

  /**
   * Récupère les créneaux disponibles du médecin.
   */
  async getCreneaux(medecin_id) {
    const [rows] = await db.query(
      `SELECT
         id,
         DATE_FORMAT(date_heure_debut, '%d/%m/%Y') AS date,
         DATE_FORMAT(date_heure_debut, '%H:%i')     AS heure_debut,
         DATE_FORMAT(date_heure_fin,   '%H:%i')     AS heure_fin,
         disponible
       FROM CRENEAUX
       WHERE medecin_id = ?
         AND date_heure_debut >= NOW()
       ORDER BY date_heure_debut ASC`,
      [medecin_id]
    );
    return rows;
  },

  /**
   * Statistiques rapides du médecin pour le dashboard.
   */
  async getStats(medecin_id) {
    const [rows] = await db.query(
      `SELECT
         COUNT(CASE WHEN statut IN ('planifie','confirme') AND date_heure >= NOW() THEN 1 END) AS rdv_a_venir,
         COUNT(CASE WHEN statut = 'termine'  THEN 1 END) AS rdv_termines,
         COUNT(CASE WHEN statut = 'annule'   THEN 1 END) AS rdv_annules,
         COUNT(*)                                          AS rdv_total
       FROM RENDEZ_VOUS
       WHERE medecin_id = ?`,
      [medecin_id]
    );
    return rows[0];
  },

};

module.exports = planningRepository;