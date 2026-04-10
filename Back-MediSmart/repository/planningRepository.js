// ============================================================
//  planningRepository.js  –  Couche Accès aux Données
//  Sprint 3 – US13 : Planning médecin
//  Responsable : Sarra Othmani
// ============================================================

const db = require('../config/db');

const planningRepository = {

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

  async getUpcomingRDV(medecin_id) {
    const [rows] = await db.query(
      `SELECT
         r.id,
         r.statut,
         r.motif,
         DATE_FORMAT(r.date_heure, '%d/%m/%Y')         AS date,
         DATE_FORMAT(r.date_heure, '%H:%i')             AS heure,
         DATE_FORMAT(r.date_heure, '%d/%m/%Y à %H:%i') AS date_heure_formatee,
         CONCAT(up.prenom, ' ', up.nom)                 AS patient_nom,
         p.telephone                                     AS patient_telephone,
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

  async getPastRDV(medecin_id) {
    const [rows] = await db.query(
      `SELECT
         r.id,
         r.statut,
         r.motif,
         DATE_FORMAT(r.date_heure, '%d/%m/%Y')         AS date,
         DATE_FORMAT(r.date_heure, '%H:%i')             AS heure,
         DATE_FORMAT(r.date_heure, '%d/%m/%Y à %H:%i') AS date_heure_formatee,
         CONCAT(up.prenom, ' ', up.nom)                 AS patient_nom,
         p.telephone                                     AS patient_telephone,
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

  // ── MODIFIÉ : ajout avg_consult_time + in_queue + today + pending ──
  async getStats(medecin_id) {

    // 1. Stats RDV
    const [rdvRows] = await db.query(
      `SELECT
         COUNT(CASE WHEN statut IN ('planifie','confirme')
                    AND date_heure >= NOW()               THEN 1 END) AS rdv_a_venir,
         COUNT(CASE WHEN statut = 'termine'               THEN 1 END) AS rdv_termines,
         COUNT(CASE WHEN statut = 'annule'                THEN 1 END) AS rdv_annules,
         COUNT(*)                                                       AS rdv_total,
         COUNT(CASE WHEN DATE(date_heure) = CURDATE()
                    AND statut IN ('planifie','confirme',
                                   'en_cours')            THEN 1 END) AS rdv_aujourd_hui,
         COUNT(CASE WHEN statut = 'planifie'
                    AND date_heure >= NOW()               THEN 1 END) AS pending_requests
       FROM RENDEZ_VOUS
       WHERE medecin_id = ?`,
      [medecin_id]
    );

    // 2. Temps moyen de consultation (minutes)
    //    Basé sur les dossiers médicaux liés à des RDV terminés.
    //    Fallback = 18 min si données insuffisantes.
    const [consultRows] = await db.query(
      `SELECT ROUND(COALESCE(
         AVG(
           TIMESTAMPDIFF(MINUTE, r.date_heure,
             TIMESTAMP(d.date_consultation, '23:59:59'))
         ), 18
       )) AS avg_consult_time_minutes
       FROM DOSSIERS_MEDICAUX d
       JOIN RENDEZ_VOUS r
         ON r.patient_id  = d.patient_id
        AND r.medecin_id  = d.medecin_id
        AND DATE(r.date_heure) = d.date_consultation
        AND r.statut = 'termine'
       WHERE d.medecin_id = ?`,
      [medecin_id]
    );

    // 3. Tickets actifs en file d'attente
    const [ticketRows] = await db.query(
      `SELECT COUNT(*) AS in_queue
       FROM TICKETS
       WHERE medecin_id = ?
         AND statut IN ('en_attente', 'en_cours')`,
      [medecin_id]
    );

    return {
      ...rdvRows[0],
      avg_consult_time_minutes: consultRows[0].avg_consult_time_minutes || 18,
      in_queue                : ticketRows[0].in_queue || 0,
    };
  },

};

module.exports = planningRepository;