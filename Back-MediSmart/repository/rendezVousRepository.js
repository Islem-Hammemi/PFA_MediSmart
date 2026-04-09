// =============================================
// repository/rendezVousRepository.js  — FIXED Sprint 3
//
//  Corrections :
//   1. getPlanningMedecin   : suppression du double JOIN PATIENTS (alias pa + p identiques)
//   2. getUpcomingByMedecin : idem double JOIN supprimé
//   3. getPendingByMedecin  : idem double JOIN supprimé
//   (Le double JOIN causait une ambiguïté et une requête inutilement lourde)
// =============================================
const pool = require("../config/db");

// ─── Rendez-vous à venir (patient) ───────────────────────────
const getUpcomingByPatient = async (patientId) => {
  const [rows] = await pool.execute(
    `SELECT r.id AS rdv_id, r.date_heure, r.statut, r.motif,
            m.id AS medecin_id, u.nom AS medecin_nom, u.prenom AS medecin_prenom,
            m.specialite, m.photo
     FROM RENDEZ_VOUS r
     JOIN MEDECINS m ON m.id = r.medecin_id
     JOIN USERS    u ON u.id = m.user_id
     WHERE r.patient_id = ?
       AND r.statut IN ('planifie', 'confirme') AND r.date_heure >= NOW()
     ORDER BY r.date_heure ASC`,
    [patientId]
  );
  return rows;
};

// ─── Rendez-vous passés (patient) ────────────────────────────
const getPastByPatient = async (patientId) => {
  const [rows] = await pool.execute(
    `SELECT r.id AS rdv_id, r.date_heure, r.statut, r.motif,
            m.id AS medecin_id, u.nom AS medecin_nom, u.prenom AS medecin_prenom,
            m.specialite, m.photo,
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

// ─── Annuler un RDV (patient) ────────────────────────────────
const annulerRdv = async (rdvId, patientId) => {
  const [result] = await pool.execute(
    `UPDATE RENDEZ_VOUS SET statut = 'annule'
     WHERE id = ? AND patient_id = ?
       AND statut IN ('planifie', 'confirme') AND date_heure > NOW()`,
    [rdvId, patientId]
  );
  return result.affectedRows;
};

// ─── Vérifier conflit patient (même jour) ────────────────────
const verifierConflitPatient = async (patientId, dateHeure) => {
  const [rows] = await pool.execute(
    `SELECT id FROM RENDEZ_VOUS
     WHERE patient_id = ?
       AND DATE(date_heure) = DATE(?)
       AND statut NOT IN ('annule')
     LIMIT 1`,
    [patientId, dateHeure]
  );
  return rows[0] || null;
};

// ─── Vérifier conflit médecin (même heure exacte) ────────────
const verifierConflitMedecin = async (medecinId, dateHeure) => {
  const [rows] = await pool.execute(
    `SELECT id FROM RENDEZ_VOUS
     WHERE medecin_id = ?
       AND date_heure = ?
       AND statut NOT IN ('annule')
     LIMIT 1`,
    [medecinId, dateHeure]
  );
  return rows[0] || null;
};

// ─── Créer un RDV simple (sans créneau) ──────────────────────
const creerRdv = async ({ patientId, medecinId, dateHeure, motif }) => {
  const [result] = await pool.execute(
    `INSERT INTO RENDEZ_VOUS (patient_id, medecin_id, date_heure, motif, statut)
     VALUES (?, ?, ?, ?, 'planifie')`,
    [patientId, medecinId, dateHeure, motif || null]
  );
  return result.insertId;
};

// ─── Détail d'un RDV (patient) ───────────────────────────────
const trouverParIdEtPatient = async (rdvId, patientId) => {
  const [rows] = await pool.execute(
    `SELECT r.id AS rdv_id, r.date_heure, r.statut, r.motif,
            m.id AS medecin_id, u.nom AS medecin_nom, u.prenom AS medecin_prenom,
            m.specialite, m.photo
     FROM RENDEZ_VOUS r
     JOIN MEDECINS m ON m.id = r.medecin_id
     JOIN USERS    u ON u.id = m.user_id
     WHERE r.id = ? AND r.patient_id = ? LIMIT 1`,
    [rdvId, patientId]
  );
  return rows[0] || null;
};

// ─── Terminer une consultation (médecin) ─────────────────────
const terminerConsultation = async (rdvId, medecinId) => {
  const [result] = await pool.execute(
    `UPDATE RENDEZ_VOUS
     SET statut = 'termine', evaluation_demandee = TRUE
     WHERE id = ? AND medecin_id = ? AND statut = 'confirme'`,
    [rdvId, medecinId]
  );
  return result.affectedRows;
};

// ─── Évaluation en attente (patient) ─────────────────────────
const getEvaluationEnAttente = async (patientId) => {
  const [rows] = await pool.execute(
    `SELECT r.id AS rendez_vous_id, r.date_heure, r.motif,
            m.id AS medecin_id, u.nom AS medecin_nom, u.prenom AS medecin_prenom,
            m.specialite, m.photo
     FROM RENDEZ_VOUS r
     JOIN MEDECINS m ON m.id = r.medecin_id
     JOIN USERS    u ON u.id = m.user_id
     WHERE r.patient_id = ? AND r.statut = 'termine'
       AND r.evaluation_demandee = TRUE
       AND NOT EXISTS (SELECT 1 FROM EVALUATIONS e WHERE e.rendez_vous_id = r.id)
     ORDER BY r.date_heure DESC LIMIT 1`,
    [patientId]
  );
  return rows[0] || null;
};

// ─── Créneaux disponibles ─────────────────────────────────────
const getCreneauxDisponibles = async (medecinId) => {
  const [rows] = await pool.execute(
    `SELECT c.id, c.medecin_id, c.date_heure_debut, c.date_heure_fin, c.disponible,
            CONCAT(u.prenom, ' ', u.nom) AS nom_medecin, m.specialite
     FROM CRENEAUX c
     JOIN MEDECINS m ON m.id = c.medecin_id
     JOIN USERS    u ON u.id = m.user_id
     WHERE c.medecin_id = ? AND c.disponible = TRUE AND c.date_heure_debut > NOW()
     ORDER BY c.date_heure_debut ASC`,
    [medecinId]
  );
  return rows;
};

// ─── Créneau par ID avec verrou de transaction ────────────────
const getCreneauById = async (creneauId, connection) => {
  const conn = connection || pool;
  const [rows] = await conn.execute(
    `SELECT * FROM CRENEAUX WHERE id = ? FOR UPDATE`,
    [creneauId]
  );
  return rows[0] || null;
};

// ─── Bloquer un créneau ───────────────────────────────────────
const marquerCreneauIndisponible = async (creneauId, connection) => {
  const conn = connection || pool;
  await conn.execute(
    `UPDATE CRENEAUX SET disponible = FALSE WHERE id = ?`,
    [creneauId]
  );
};

// ─── Créer RDV dans une transaction (via créneau) ────────────
const creerRdvAvecConnexion = async ({ patientId, medecinId, dateHeure, motif }, connection) => {
  const conn = connection || pool;
  const [result] = await conn.execute(
    `INSERT INTO RENDEZ_VOUS (patient_id, medecin_id, date_heure, motif, statut)
     VALUES (?, ?, ?, ?, 'planifie')`,
    [patientId, medecinId, dateHeure, motif || null]
  );
  return result.insertId;
};

// ─── Vérifier conflit RDV (fenêtre 30 min) ───────────────────
const checkConflitRdv = async (medecinId, dateHeure) => {
  const [[{ total }]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM RENDEZ_VOUS
     WHERE medecin_id = ? AND statut NOT IN ('annule')
       AND ABS(TIMESTAMPDIFF(MINUTE, date_heure, ?)) < 30`,
    [medecinId, dateHeure]
  );
  return Number(total) > 0;
};

// ─── Planning complet du médecin ─────────────────────────────
// FIX : suppression du double JOIN PATIENTS (alias pa ET p identiques → erreur silencieuse)
const getPlanningMedecin = async (medecinId) => {
  const [rows] = await pool.execute(
    `SELECT r.id AS rdv_id, r.date_heure, r.statut, r.motif, r.created_at,
            pa.id AS patient_id, u.nom AS patient_nom, u.prenom AS patient_prenom,
            pa.telephone
     FROM RENDEZ_VOUS r
     JOIN PATIENTS pa ON pa.id = r.patient_id
     JOIN USERS    u  ON u.id  = pa.user_id
     WHERE r.medecin_id = ?
     ORDER BY r.date_heure ASC`,
    [medecinId]
  );
  return rows;
};

// ─── Prochains RDV du médecin ────────────────────────────────
// FIX : suppression du double JOIN PATIENTS
const getUpcomingByMedecin = async (medecinId) => {
  const [rows] = await pool.execute(
    `SELECT r.id AS rdv_id, r.date_heure, r.statut, r.motif,
            pa.id AS patient_id, u.nom AS patient_nom, u.prenom AS patient_prenom,
            pa.telephone
     FROM RENDEZ_VOUS r
     JOIN PATIENTS pa ON pa.id = r.patient_id
     JOIN USERS    u  ON u.id  = pa.user_id
     WHERE r.medecin_id = ? AND r.date_heure >= NOW()
       AND r.statut IN ('planifie', 'confirme')
     ORDER BY r.date_heure ASC`,
    [medecinId]
  );
  return rows;
};

// ─── RDV en attente de confirmation (médecin) ────────────────
// FIX : suppression du double JOIN PATIENTS
const getPendingByMedecin = async (medecinId) => {
  const [rows] = await pool.execute(
    `SELECT r.id AS rdv_id, r.date_heure, r.statut, r.motif,
            pa.id AS patient_id, u.nom AS patient_nom, u.prenom AS patient_prenom,
            pa.telephone
     FROM RENDEZ_VOUS r
     JOIN PATIENTS pa ON pa.id = r.patient_id
     JOIN USERS    u  ON u.id  = pa.user_id
     WHERE r.medecin_id = ? AND r.statut = 'planifie' AND r.date_heure >= NOW()
     ORDER BY r.date_heure ASC`,
    [medecinId]
  );
  return rows;
};

// ─── Confirmer un RDV (médecin) ──────────────────────────────
const confirmerRdv = async (rdvId, medecinId) => {
  const [result] = await pool.execute(
    `UPDATE RENDEZ_VOUS SET statut = 'confirme'
     WHERE id = ? AND medecin_id = ? AND statut = 'planifie'`,
    [rdvId, medecinId]
  );
  return result.affectedRows;
};

// ─── Refuser un RDV (médecin) ────────────────────────────────
const refuserRdv = async (rdvId, medecinId) => {
  const [result] = await pool.execute(
    `UPDATE RENDEZ_VOUS SET statut = 'annule'
     WHERE id = ? AND medecin_id = ? AND statut IN ('planifie', 'confirme')`,
    [rdvId, medecinId]
  );
  return result.affectedRows;
};

module.exports = {
  // ── Patient ──────────────────────────────────────────────────
  getUpcomingByPatient,
  getPastByPatient,
  annulerRdv,
  creerRdv,
  trouverParIdEtPatient,
  getEvaluationEnAttente,
  // ── Validation conflits ──────────────────────────────────────
  verifierConflitPatient,
  verifierConflitMedecin,
  // ── Créneaux ─────────────────────────────────────────────────
  getCreneauxDisponibles,
  getCreneauById,
  marquerCreneauIndisponible,
  creerRdvAvecConnexion,
  checkConflitRdv,
  // ── Médecin ──────────────────────────────────────────────────
  terminerConsultation,
  getPlanningMedecin,
  getUpcomingByMedecin,
  getPendingByMedecin,
  confirmerRdv,
  refuserRdv,
};