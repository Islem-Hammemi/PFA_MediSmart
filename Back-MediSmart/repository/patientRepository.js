// =============================================
// repository/patientRepository.js
// Accès MySQL – Tables USERS + PATIENTS
// =============================================
const pool = require("../config/db");

// ── Trouver un patient par email (avec son profil) ───────────────────────────
const trouverParEmail = async (email) => {
  const [rows] = await pool.execute(
    // FIX: u.role était déjà présent ici – OK
    `SELECT u.id AS user_id, u.email, u.password_hash, u.nom, u.prenom, u.role,
            p.id AS patient_id, p.date_naissance, p.telephone
     FROM USERS u
     JOIN PATIENTS p ON p.user_id = u.id
     WHERE u.email = ? AND u.role = 'patient'
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

// ── Trouver un patient par user_id (sans mot de passe) ──────────────────────
const trouverParId = async (userId) => {
  const [rows] = await pool.execute(
    // FIX: u.role ajouté – était manquant, causait req.utilisateur.role = undefined
    // ce qui faisait échouer autoriserRole("patient") avec un 403 systématique
    `SELECT u.id AS user_id, u.email, u.nom, u.prenom, u.role,
            p.id AS patient_id, p.date_naissance, p.telephone
     FROM USERS u
     JOIN PATIENTS p ON p.user_id = u.id
     WHERE u.id = ? AND u.role = 'patient'
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

// ── Créer un patient (USERS + PATIENTS en transaction) ──────────────────────
const creer = async ({ nom, prenom, email, passwordHash, telephone, dateNaissance, assurance }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Insérer dans USERS
    const [userResult] = await conn.execute(
      `INSERT INTO USERS (email, password_hash, nom, prenom, role)
       VALUES (?, ?, ?, ?, 'patient')`,
      [email, passwordHash, nom, prenom]
    );
    const userId = userResult.insertId;

    // 2. Insérer dans PATIENTS
    await conn.execute(
      `INSERT INTO PATIENTS (user_id, date_naissance, telephone)
       VALUES (?, ?, ?)`,
      [userId, dateNaissance || null, telephone || null]
    );

    await conn.commit();
    return trouverParId(userId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
const getTicketsByPatient=async (patientId)=>{
    const [rows] = await pool.execute(
        `SELECT
        t.id          AS ticket_id,
        t.numero,
        t.position,
        t.statut,
        t.created_at,
        m.id          AS medecin_id,
        u.nom         AS medecin_nom,
        u.prenom      AS medecin_prenom,
        m.specialite
     FROM   TICKETS  t
     JOIN   MEDECINS m ON m.id  = t.medecin_id
     JOIN   USERS    u ON u.id  = m.user_id
     WHERE  t.patient_id = ?
     ORDER  BY t.created_at DESC`,
    [patientId]
  );
  return rows;
};
const getDossiersByPatient = async (patientId) => {
  const [rows] = await pool.execute(
    `SELECT
        d.id                AS dossier_id,
        d.date_consultation,
        d.diagnostic,
        d.traitement,
        d.notes,
        m.id                AS medecin_id,
        u.nom               AS medecin_nom,
        u.prenom            AS medecin_prenom,
        m.specialite
     FROM   DOSSIERS_MEDICAUX d
     JOIN   MEDECINS          m ON m.id  = d.medecin_id
     JOIN   USERS             u ON u.id  = m.user_id
     WHERE  d.patient_id = ?
     ORDER  BY d.date_consultation DESC`,
    [patientId]
  );
  return rows;
};
// ── US12 : Supprimer la session (logout) ─────────────────────
const deleteSession = async (token) => {
  const [result] = await pool.execute(
    'DELETE FROM SESSIONS WHERE token = ?',
    [token]
  );
  return result.affectedRows;
};
 
// ── Utilitaire : récupérer patient_id depuis user_id ─────────
// Réutilise trouverParId pour éviter une requête SQL supplémentaire
const getPatientIdByUserId = async (userId) => {
  const patient = await trouverParId(userId);
  return patient?.patient_id ?? null;
};

module.exports = {
  trouverParEmail,
  trouverParId,
  creer,
  getTicketsByPatient,
  getDossiersByPatient,
  deleteSession,
  getPatientIdByUserId,
};