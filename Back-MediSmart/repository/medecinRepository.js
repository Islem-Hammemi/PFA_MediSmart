const pool = require("../config/db");



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
    WHERE
      nom        LIKE ? OR
      prenom     LIKE ? OR
      specialite LIKE ?
    ORDER BY nom ASC`,
    [keyword, keyword, keyword]
  );
  return rows;
};

const findPresents = async () => {
  const [rows] = await pool.query(`
    SELECT
      v.medecin_id   AS id,
      v.nom,
      v.prenom,
      v.specialite,
      v.photo,
      v.note_moyenne AS evaluation,
      v.nb_evaluations,
      v.statut
    FROM VW_NOTE_MEDECIN v
    WHERE v.statut IN ('disponible', 'en_consultation')
    ORDER BY v.nom ASC
  `);
  return rows;
};

const checkIn = async (userId) => {
  await pool.query(
    "UPDATE MEDECINS SET statut = 'disponible' WHERE user_id = ?",
    [userId]
  );
  const [rows] = await pool.query(
    `SELECT m.id, m.statut, m.photo, u.nom, u.prenom
     FROM MEDECINS m
     JOIN USERS u ON u.id = m.user_id
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
     FROM MEDECINS m
     JOIN USERS u ON u.id = m.user_id
     WHERE m.user_id = ?`,
    [userId]
  );
  return rows[0];
};

const updatePhoto = async (userId, photoPath) => {
  await pool.query(
    "UPDATE MEDECINS SET photo = ? WHERE user_id = ?",
    [photoPath, userId]
  );
  const [rows] = await pool.query(
    `SELECT m.*, u.nom, u.prenom
     FROM MEDECINS m
     JOIN USERS u ON u.id = m.user_id
     WHERE m.user_id = ?`,
    [userId]
  );
  return rows[0];
};



const getMedecinSemaine = async () => {
  const [rows] = await pool.query(
     `SELECT * FROM VW_MEDECIN_SEMAINE LIMIT 1`
  );
  const doc = rows[0];
 
  if (!doc) return null;

  const [comments] = await pool.query(
    `SELECT commentaire 
     FROM EVALUATIONS
     WHERE medecin_id = ? 
       AND commentaire IS NOT NULL 
       AND commentaire != ''
     ORDER BY note DESC
     LIMIT 1`,
    [doc.medecin_id ?? doc.id]
  );


  doc.commentaire = comments[0]?.commentaire || null;
  return doc;
};

// =============================================
// repository/medecinRepository.js
// Accès base de données MySQL - Table medecin
// Toutes les requêtes SQL liées au médecin
// =============================================


// ── Trouver un médecin par email ─────────────────────────────────────────────
const trouverParEmail = async (email) => {
  const [rows] = await pool.execute(
     `SELECT u.id AS user_id, u.email, u.password_hash, u.nom, u.prenom, u.role,
            m.id AS medecin_id, m.specialite, m.numero_ordre
     FROM USERS u
     JOIN MEDECINS m ON m.user_id = u.id
     WHERE u.email = ? AND u.role = 'medecin'
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

// ── Trouver un médecin par ID ────────────────────────────────────────────────
const trouverParId = async (id) => {
  const [rows] = await pool.execute(
    // FIX: u.role ajouté – était manquant, causait req.utilisateur.role = undefined
    // ce qui faisait échouer autoriserRole("medecin") avec un 403 systématique
    `SELECT u.id AS user_id, u.email, u.nom, u.prenom, u.role,
            m.id AS medecin_id, m.specialite, m.numero_ordre
     FROM USERS u
     JOIN MEDECINS m ON m.user_id = u.id
     WHERE u.id = ? AND u.role = 'medecin'
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
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
};