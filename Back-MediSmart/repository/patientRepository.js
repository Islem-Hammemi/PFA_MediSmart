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

module.exports = {
  trouverParEmail,
  trouverParId,
  creer,
};