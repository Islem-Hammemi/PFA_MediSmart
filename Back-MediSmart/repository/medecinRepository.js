const pool = require("../config/db");

// ── Public queries ────────────────────────────────────────────

const findAll = async () => {
  const [rows] = await pool.query(`
    SELECT
      medecin_id   AS id,
      nom,
      prenom,
      specialite,
      photo,
      statut,
      note_moyenne AS evaluation,
      nb_evaluations
    FROM VW_NOTE_MEDECIN
    ORDER BY nom ASC
  `);
  return rows;
};

const findBySearch = async (keyword) => {
  const [rows] = await pool.query(
    `SELECT
      medecin_id   AS id,
      nom,
      prenom,
      specialite,
      photo,
      statut,
      note_moyenne AS evaluation,
      nb_evaluations
    FROM VW_NOTE_MEDECIN
    WHERE nom LIKE ? OR prenom LIKE ? OR specialite LIKE ?
    ORDER BY nom ASC`,
    [keyword, keyword, keyword]
  );
  return rows;
};

const findPresents = async () => {
  const [rows] = await pool.query(`
    SELECT
      medecin_id   AS id,
      nom,
      prenom,
      specialite,
      photo,
      statut,
      note_moyenne AS evaluation,
      nb_evaluations
    FROM VW_NOTE_MEDECIN
    WHERE statut IN ('disponible', 'en_consultation')
    ORDER BY nom ASC
  `);
  return rows;
};

// ── Checkin / Checkout (legacy — by userId in body) ───────────

const checkIn = async (userId) => {
  await pool.query(
    "UPDATE MEDECINS SET statut = 'disponible' WHERE user_id = ?",
    [userId]
  );
  const [rows] = await pool.query(
    `SELECT m.id, m.statut, m.photo, u.nom, u.prenom
     FROM MEDECINS m JOIN USERS u ON u.id = m.user_id
     WHERE m.user_id = ?`,
    [userId]
  );
  return rows[0];
};

const checkOut = async (userId) => {
  await pool.query(
    "UPDATE MEDECINS SET statut = 'absent' WHERE user_id = ?",
    [userId]
  );
  const [rows] = await pool.query(
    `SELECT m.id, m.statut, m.photo, u.nom, u.prenom
     FROM MEDECINS m JOIN USERS u ON u.id = m.user_id
     WHERE m.user_id = ?`,
    [userId]
  );
  return rows[0];
};

// ✅ FIX — photo stored as /uploads/medecins/... served from /uploads/medecins/
const updatePhoto = async (userId, photoPath) => {
  await pool.query(
    "UPDATE MEDECINS SET photo = ? WHERE user_id = ?",
    [photoPath, userId]
  );
  const [rows] = await pool.query(
    `SELECT m.id, m.photo, m.statut, m.specialite, u.nom, u.prenom
     FROM MEDECINS m JOIN USERS u ON u.id = m.user_id
     WHERE m.user_id = ?`,
    [userId]
  );
  return rows[0];
};

const getMedecinSemaine = async () => {
  const [rows] = await pool.query(
    `SELECT
       medecin_id      AS id,
       nom,
       prenom,
       specialite,
       photo,
       note_moyenne,
       nb_evaluations,
       nb_patients_semaine
     FROM VW_MEDECIN_SEMAINE
     LIMIT 1`
  );
  const doc = rows[0];
  if (!doc) return null;
  const [comments] = await pool.query(
    `SELECT commentaire FROM EVALUATIONS
     WHERE medecin_id = ? AND commentaire IS NOT NULL AND commentaire != ''
     ORDER BY note DESC LIMIT 1`,
    [doc.id]
  );

  doc.commentaire = comments[0]?.commentaire || null;
  return doc;
};
// =============================================
// repository/medecinRepository.js
// Accès base de données MySQL - Table medecin
// Toutes les requêtes SQL liées au médecin
// =============================================

const trouverParEmail = async (email) => {
  const [rows] = await pool.execute(
    `SELECT u.id AS user_id, u.email, u.password_hash, u.nom, u.prenom, u.role,
            m.id AS medecin_id, m.specialite, m.numero_ordre, m.statut, m.photo
     FROM USERS u
     JOIN MEDECINS m ON m.user_id = u.id
     WHERE u.email = ? AND u.role = 'medecin'
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

// ✅ FIX — includes specialite, statut, photo so DoctorProfile + Statusdropdown work
const trouverParId = async (id) => {
  const [rows] = await pool.execute(
    `SELECT u.id AS user_id, u.email, u.nom, u.prenom, u.role,
            m.id AS medecin_id, m.specialite, m.numero_ordre, m.statut, m.photo
     FROM USERS u
     JOIN MEDECINS m ON m.user_id = u.id
     WHERE u.id = ? AND u.role = 'medecin'
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

// ✅ NEW — get statut by medecin_id (for Statusdropdown)
const getStatutById = async (medecinId) => {
  const [rows] = await pool.query(
    `SELECT statut FROM MEDECINS WHERE id = ? LIMIT 1`,
    [medecinId]
  );
  return rows[0] || null;
};

// ✅ NEW — update statut by medecin_id
const updateStatut = async (medecinId, statut) => {
  await pool.query(
    `UPDATE MEDECINS SET statut = ? WHERE id = ?`,
    [statut, medecinId]
  );
};

// ✅ NEW — update USERS table (prenom, nom, email) + telephone on MEDECINS if column exists
const updateUserProfile = async (user_id, { prenom, nom, email, telephone }) => {
  await pool.query(
    `UPDATE USERS SET prenom = ?, nom = ?, email = ? WHERE id = ?`,
    [prenom, nom, email, user_id]
  );
  // Store telephone in MEDECINS if you have that column; otherwise skip
  if (telephone !== undefined) {
    try {
      await pool.query(
        `UPDATE MEDECINS SET telephone = ? WHERE user_id = ?`,
        [telephone, user_id]
      );
    } catch (e) {
      // Column may not exist yet — silently ignore
    }
  }
};

// ✅ NEW — dashboard stats
const getStats = async () => {
  const [rows] = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM MEDECINS WHERE statut IN ('disponible','en_consultation')) AS doctorsAvailable,
       (SELECT COUNT(*) FROM TICKETS WHERE DATE(created_at) = CURDATE())               AS patientsServedToday,
       (SELECT ROUND(AVG(TIMESTAMPDIFF(MINUTE, created_at, updated_at)), 0)
        FROM TICKETS WHERE statut = 'termine')                                          AS avgWaitTime`
  );
  return rows[0];
};

module.exports = {
  findAll,
  findBySearch,
  findPresents,
  checkIn,
  checkOut,
  updatePhoto,
  getMedecinSemaine,
  trouverParEmail,
  trouverParId,
  getStatutById,
  updateStatut,
  updateUserProfile,
  getStats,
};