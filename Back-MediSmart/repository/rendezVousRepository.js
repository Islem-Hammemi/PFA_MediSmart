// =============================================
// repository/rendezVousRepository.js
// =============================================
const pool = require("../config/db");

// ─── Rendez-vous à venir ──────────────────────────────────────
const getUpcomingByPatient = async (patientId) => {
  const [rows] = await pool.execute(
    `SELECT
        r.id              AS rdv_id,
        r.date_heure,
        r.statut,
        r.motif,
        m.id              AS medecin_id,
        u.nom             AS medecin_nom,
        u.prenom          AS medecin_prenom,
        m.specialite,
        m.photo
     FROM RENDEZ_VOUS r
     JOIN MEDECINS m ON m.id = r.medecin_id
     JOIN USERS    u ON u.id = m.user_id
     WHERE r.patient_id = ?
       AND r.statut IN ('planifie', 'confirme')
       AND r.date_heure >= NOW()
     ORDER BY r.date_heure ASC`,
    [patientId]
  );
  return rows;
};

// ─── Rendez-vous passés / terminés / annulés ─────────────────
const getPastByPatient = async (patientId) => {
  const [rows] = await pool.execute(
    `SELECT
        r.id              AS rdv_id,
        r.date_heure,
        r.statut,
        r.motif,
        m.id              AS medecin_id,
        u.nom             AS medecin_nom,
        u.prenom          AS medecin_prenom,
        m.specialite,
        m.photo,
        (SELECT COUNT(*) FROM EVALUATIONS e WHERE e.rendez_vous_id = r.id) AS has_evaluation
     FROM RENDEZ_VOUS r
     JOIN MEDECINS m ON m.id = r.medecin_id
     JOIN USERS    u ON u.id = m.user_id
     WHERE r.patient_id = ?
       AND (r.statut IN ('termine', 'annule') OR r.date_heure < NOW())
     ORDER BY r.date_heure DESC`,
    [patientId]
  );
  return rows;
};

// ─── Annuler un RDV ──────────────────────────────────────────
const annulerRdv = async (rdvId, patientId) => {
  const [result] = await pool.execute(
    `UPDATE RENDEZ_VOUS
     SET statut = 'annule'
     WHERE id = ?
       AND patient_id = ?
       AND statut IN ('planifie', 'confirme')
       AND date_heure > NOW()`,
    [rdvId, patientId]
  );
  return result.affectedRows;
};

// ─── Créer un RDV ────────────────────────────────────────────
const creerRdv = async ({ patientId, medecinId, dateHeure, motif }) => {
  const [result] = await pool.execute(
    `INSERT INTO RENDEZ_VOUS (patient_id, medecin_id, date_heure, motif, statut)
     VALUES (?, ?, ?, ?, 'planifie')`,
    [patientId, medecinId, dateHeure, motif || null]
  );
  return result.insertId;
};

// ─── Détail d'un seul RDV ─────────────────────────────────────
const trouverParIdEtPatient = async (rdvId, patientId) => {
  const [rows] = await pool.execute(
    `SELECT
        r.id              AS rdv_id,
        r.date_heure,
        r.statut,
        r.motif,
        m.id              AS medecin_id,
        u.nom             AS medecin_nom,
        u.prenom          AS medecin_prenom,
        m.specialite,
        m.photo
     FROM RENDEZ_VOUS r
     JOIN MEDECINS m ON m.id = r.medecin_id
     JOIN USERS    u ON u.id = m.user_id
     WHERE r.id = ? AND r.patient_id = ?
     LIMIT 1`,
    [rdvId, patientId]
  );
  return rows[0] || null;
};

// ─── (Médecin) Terminer une consultation ─────────────────────
const terminerConsultation = async (rdvId, medecinId) => {
  const [result] = await pool.execute(
    `UPDATE RENDEZ_VOUS
     SET statut = 'termine',
         evaluation_demandee = TRUE
     WHERE id = ?
       AND medecin_id = ?
       AND statut = 'confirme'`,
    [rdvId, medecinId]
  );
  return result.affectedRows;
};

// ─── Évaluation en attente pour un patient ───────────────────
const getEvaluationEnAttente = async (patientId) => {
  const [rows] = await pool.execute(
    `SELECT
        r.id              AS rendez_vous_id,
        r.date_heure,
        r.motif,
        m.id              AS medecin_id,
        u.nom             AS medecin_nom,
        u.prenom          AS medecin_prenom,
        m.specialite,
        m.photo
     FROM RENDEZ_VOUS r
     JOIN MEDECINS m ON m.id = r.medecin_id
     JOIN USERS    u ON u.id = m.user_id
     WHERE r.patient_id = ?
       AND r.statut = 'termine'
       AND r.evaluation_demandee = TRUE
       AND NOT EXISTS (
           SELECT 1 FROM EVALUATIONS e WHERE e.rendez_vous_id = r.id
       )
     ORDER BY r.date_heure DESC
     LIMIT 1`,
    [patientId]
  );
  return rows[0] || null;
};

module.exports = {
  getUpcomingByPatient,
  getPastByPatient,
  annulerRdv,
  creerRdv,
  trouverParIdEtPatient,
  terminerConsultation,
  getEvaluationEnAttente,
};