// ============================================================
//  dossierRepository.js  –  Couche Accès aux Données
//  Sprint 3 – US14 : Accès dossiers patients (médecin)
//  Responsable : Sarra Othmani
// ============================================================

const db = require('../config/db');

const verifierRelation = async (medecin_id, patient_id) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS nb
     FROM RENDEZ_VOUS
     WHERE medecin_id = ? AND patient_id = ?`,
    [medecin_id, patient_id]
  );
  return rows[0].nb > 0;
};

// ── MODIFIÉ : ajout age + date_naissance formatée ─────────────
const getMesPatientsListe = async (medecin_id) => {
  const [rows] = await db.query(
    `SELECT DISTINCT
       pa.id                                          AS patient_id,
       CONCAT(u.prenom, ' ', u.nom)                   AS nom_complet,
       u.email,
       pa.telephone,
       DATE_FORMAT(pa.date_naissance, '%d/%m/%Y')     AS date_naissance,
       TIMESTAMPDIFF(YEAR, pa.date_naissance, NOW())  AS age,
       COUNT(r.id)                                    AS nb_rdv,
       MAX(DATE_FORMAT(r.date_heure, '%d/%m/%Y à %H:%i')) AS dernier_rdv
     FROM RENDEZ_VOUS r
     JOIN PATIENTS pa ON pa.id = r.patient_id
     JOIN USERS    u  ON u.id  = pa.user_id
     WHERE r.medecin_id = ?
     GROUP BY pa.id, u.prenom, u.nom, u.email, pa.telephone, pa.date_naissance
     ORDER BY dernier_rdv DESC`,
    [medecin_id]
  );
  return rows;
};

// ── MODIFIÉ : ajout age ───────────────────────────────────────
const getPatientProfil = async (patient_id) => {
  const [rows] = await db.query(
    `SELECT
       pa.id                                          AS patient_id,
       CONCAT(u.prenom, ' ', u.nom)                   AS nom_complet,
       u.email,
       pa.telephone,
       DATE_FORMAT(pa.date_naissance, '%d/%m/%Y')     AS date_naissance,
       TIMESTAMPDIFF(YEAR, pa.date_naissance, NOW())  AS age
     FROM PATIENTS pa
     JOIN USERS u ON u.id = pa.user_id
     WHERE pa.id = ?`,
    [patient_id]
  );
  return rows[0] || null;
};

const getDossiersPatient = async (medecin_id, patient_id) => {
  const [rows] = await db.query(
    `SELECT
       d.id,
       DATE_FORMAT(d.date_consultation, '%d/%m/%Y') AS date_consultation,
       d.diagnostic,
       d.traitement,
       d.notes,
       DATE_FORMAT(d.created_at, '%d/%m/%Y à %H:%i') AS created_at
     FROM DOSSIERS_MEDICAUX d
     WHERE d.medecin_id = ? AND d.patient_id = ?
     ORDER BY d.date_consultation DESC`,
    [medecin_id, patient_id]
  );
  return rows;
};

const getRDVPatient = async (medecin_id, patient_id) => {
  const [rows] = await db.query(
    `SELECT
       r.id,
       r.statut,
       r.motif,
       DATE_FORMAT(r.date_heure, '%d/%m/%Y à %H:%i') AS date_heure
     FROM RENDEZ_VOUS r
     WHERE r.medecin_id = ? AND r.patient_id = ?
     ORDER BY r.date_heure DESC`,
    [medecin_id, patient_id]
  );
  return rows;
};

const getMedecinByUserId = async (user_id) => {
  const [rows] = await db.query(
    `SELECT id AS medecin_id FROM MEDECINS WHERE user_id = ?`,
    [user_id]
  );
  return rows[0] || null;
};

const creerDossier = async ({ patientId, medecinId, diagnostic, traitement, notes }) => {
  const [result] = await db.query(
    `INSERT INTO DOSSIERS_MEDICAUX
       (patient_id, medecin_id, date_consultation, diagnostic, traitement, notes)
     VALUES (?, ?, CURDATE(), ?, ?, ?)`,
    [patientId, medecinId, diagnostic || null, traitement || null, notes || null]
  );
  return result.insertId;
};

const getDossiersByPatientForMedecin = async (patientId) => {
  const [rows] = await db.query(
    `SELECT
       d.id AS dossier_id,
       DATE_FORMAT(d.date_consultation, '%d/%m/%Y') AS date_consultation,
       d.diagnostic,
       d.traitement,
       d.notes,
       DATE_FORMAT(d.created_at, '%d/%m/%Y à %H:%i') AS created_at,
       CONCAT(u.prenom, ' ', u.nom) AS nom_medecin,
       m.specialite
     FROM DOSSIERS_MEDICAUX d
     JOIN MEDECINS m ON m.id = d.medecin_id
     JOIN USERS    u ON u.id = m.user_id
     WHERE d.patient_id = ?
     ORDER BY d.date_consultation DESC`,
    [patientId]
  );
  return rows;
};

module.exports = {
  verifierRelation,
  getMesPatientsListe,
  getPatientProfil,
  getDossiersPatient,
  getRDVPatient,
  getMedecinByUserId,
  creerDossier,
  getDossiersByPatientForMedecin,
};