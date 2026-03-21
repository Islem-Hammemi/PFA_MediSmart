// ============================================================
//  evaluationRepository.js  –  Couche Accès aux Données
//  Sprint 2 – US11 : Évaluation par rendez-vous
//  Responsable : Sarra Othmani
// ============================================================

const db = require('../config/db');

const evaluationRepository = {

  /**
   * Récupère le rendez-vous par son id.
   * Vérifie qu'il appartient bien au patient concerné.
   */
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

  /**
   * Vérifie si ce rendez-vous a déjà une évaluation.
   * Contrainte : 1 seule évaluation par rendez-vous.
   */
  async evaluationExistante(rendez_vous_id) {
    const [rows] = await db.query(
      `SELECT id FROM EVALUATIONS
       WHERE rendez_vous_id = ?
       LIMIT 1`,
      [rendez_vous_id]
    );
    return rows[0] || null;
  },

  /**
   * Enregistre la nouvelle évaluation liée au rendez-vous.
   */
  async creerEvaluation({ patient_id, medecin_id, rendez_vous_id, note, commentaire }) {
    const [result] = await db.query(
      `INSERT INTO EVALUATIONS (patient_id, medecin_id, rendez_vous_id, note, commentaire)
       VALUES (?, ?, ?, ?, ?)`,
      [patient_id, medecin_id, rendez_vous_id, note, commentaire || null]
    );
    return result.insertId;
  },

  /**
   * Recalcule la note moyenne et nb_evaluations du médecin.
   */
  async mettreAJourNoteMoyenne(medecin_id) {
    await db.query(
      `UPDATE MEDECINS
       SET
         note_moyenne   = (
           SELECT ROUND(AVG(note), 2)
           FROM EVALUATIONS
           WHERE medecin_id = ?
         ),
         nb_evaluations = (
           SELECT COUNT(*)
           FROM EVALUATIONS
           WHERE medecin_id = ?
         )
       WHERE id = ?`,
      [medecin_id, medecin_id, medecin_id]
    );
  },

  /**
   * Récupère les détails complets de l'évaluation pour la réponse.
   */
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
       JOIN RENDEZ_VOUS  r  ON r.id   = e.rendez_vous_id
       JOIN MEDECINS     m  ON m.id   = e.medecin_id
       JOIN USERS        um ON um.id  = m.user_id
       WHERE e.id = ?`,
      [evaluation_id]
    );
    return rows[0] || null;
  },

};

module.exports = evaluationRepository;