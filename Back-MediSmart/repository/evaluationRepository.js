// ============================================================
//  evaluationRepository.js  –  Couche Accès aux Données
//  Sprint 2 – US11 : Évaluation par rendez-vous
//  Sprint 3 – GET évaluations médecin (dashboard + Reviews page)
// ============================================================

const db = require('../config/db');

const evaluationRepository = {

  async getRendezVousById(rendez_vous_id, patient_id) {
    const [rows] = await db.query(
      `SELECT
         r.id,
         r.statut,
         r.medecin_id,
         r.patient_id,
         DATE_FORMAT(r.date_heure, '%d/%m/%Y à %H:%i') AS date_rdv,
         CONCAT(u.prenom, ' ', u.nom)                   AS medecin_nom
       FROM RENDEZ_VOUS r
       JOIN MEDECINS m ON m.id  = r.medecin_id
       JOIN USERS    u ON u.id  = m.user_id
       WHERE r.id = ? AND r.patient_id = ?`,
      [rendez_vous_id, patient_id]
    );
    return rows[0] || null;
  },

  async evaluationExistante(rendez_vous_id) {
    if (!rendez_vous_id) return null;
    const [rows] = await db.query(
      `SELECT id FROM EVALUATIONS WHERE rendez_vous_id = ? LIMIT 1`,
      [rendez_vous_id]
    );
    return rows[0] || null;
  },

async creerEvaluation({ patient_id, medecin_id, rendez_vous_id, ticket_id, note, commentaire }) {
  const [result] = await db.query(
    `INSERT INTO EVALUATIONS (patient_id, medecin_id, rendez_vous_id, ticket_id, note, commentaire)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [patient_id, medecin_id, rendez_vous_id || null, ticket_id || null, note, commentaire || null]
  );
  return result.insertId;
},

  // FIX : appeler desactiverFlag depuis le service après creerEvaluation
  async desactiverFlag(rendez_vous_id) {
    await db.query(
      `UPDATE RENDEZ_VOUS SET evaluation_demandee = FALSE WHERE id = ?`,
      [rendez_vous_id]
    );
  },

  async mettreAJourNoteMoyenne(medecin_id) {
    await db.query(
      `UPDATE MEDECINS
       SET
         note_moyenne   = (SELECT ROUND(AVG(note), 2) FROM EVALUATIONS WHERE medecin_id = ?),
         nb_evaluations = (SELECT COUNT(*) FROM EVALUATIONS WHERE medecin_id = ?)
       WHERE id = ?`,
      [medecin_id, medecin_id, medecin_id]
    );
  },

async getEvaluationById(evaluation_id) {
  const [rows] = await db.query(
    `SELECT
       e.id,
       e.note,
       e.commentaire,
       DATE_FORMAT(e.created_at, '%d/%m/%Y à %H:%i') AS date_evaluation,
       CONCAT(um.prenom, ' ', um.nom)                 AS medecin_nom,
       m.specialite,
       ROUND(m.note_moyenne, 2)                        AS note_moyenne_medecin,
       m.nb_evaluations,
       DATE_FORMAT(r.date_heure, '%d/%m/%Y à %H:%i')  AS date_rendez_vous
     FROM EVALUATIONS  e
     JOIN MEDECINS     m  ON m.id   = e.medecin_id
     JOIN USERS        um ON um.id  = m.user_id
     LEFT JOIN RENDEZ_VOUS r ON r.id = e.rendez_vous_id
     WHERE e.id = ?`,
    [evaluation_id]
  );
  return rows[0] || null;
},
  // FIX : parseInt() obligatoire — MySQL2 passe LIMIT en string sinon → erreur SQL
async getEvaluationsMedecin(medecin_id, limit = 10) {
  const safeLimit = parseInt(limit, 10);
  const [rows] = await db.query(
    `SELECT
       e.id,
       e.note,
       e.commentaire,
       DATE_FORMAT(e.created_at, '%d/%m/%Y à %H:%i') AS date_evaluation,
       CONCAT(up.prenom, ' ', up.nom)                 AS patient_nom,
       DATE_FORMAT(COALESCE(r.date_heure, e.created_at), '%d/%m/%Y') AS date_consultation
     FROM EVALUATIONS e
     JOIN PATIENTS    pa ON pa.id = e.patient_id
     JOIN USERS       up ON up.id = pa.user_id
     LEFT JOIN RENDEZ_VOUS r ON r.id = e.rendez_vous_id   -- ← LEFT JOIN
     WHERE e.medecin_id = ?
     ORDER BY e.created_at DESC
     LIMIT ${safeLimit}`,
    [medecin_id]
  );
  return rows;
},

  async getStatsMedecin(medecin_id) {
    const [rows] = await db.query(
      `SELECT
         ROUND(AVG(e.note), 2)                        AS note_moyenne,
         COUNT(*)                                      AS nb_evaluations,
         SUM(CASE WHEN e.note = 5 THEN 1 ELSE 0 END) AS nb_5,
         SUM(CASE WHEN e.note = 4 THEN 1 ELSE 0 END) AS nb_4,
         SUM(CASE WHEN e.note = 3 THEN 1 ELSE 0 END) AS nb_3,
         SUM(CASE WHEN e.note = 2 THEN 1 ELSE 0 END) AS nb_2,
         SUM(CASE WHEN e.note = 1 THEN 1 ELSE 0 END) AS nb_1
       FROM EVALUATIONS e
       WHERE e.medecin_id = ?`,
      [medecin_id]
    );
    return rows[0];
  },

  async getMedecinById(medecin_id) {
    const [rows] = await db.query(
      `SELECT m.id, CONCAT(u.prenom, ' ', u.nom) AS nom, m.specialite
       FROM MEDECINS m
       JOIN USERS u ON u.id = m.user_id
       WHERE m.id = ?`,
      [medecin_id]
    );
    return rows[0] || null;
  },

};

module.exports = evaluationRepository;