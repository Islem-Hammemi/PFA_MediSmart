// =============================================
// repository/patientRepository.js
// =============================================
const pool = require("../config/db");

const trouverParEmail = async (email) => {
  const [rows] = await pool.execute(
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

const trouverParId = async (userId) => {
  const [rows] = await pool.execute(
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

const creer = async ({ nom, prenom, email, passwordHash, telephone, dateNaissance }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [userResult] = await conn.execute(
      `INSERT INTO USERS (email, password_hash, nom, prenom, role)
       VALUES (?, ?, ?, ?, 'patient')`,
      [email, passwordHash, nom, prenom]
    );
    const userId = userResult.insertId;
    
    await conn.execute(
      `INSERT INTO PATIENTS (user_id, date_naissance, telephone)
       VALUES (?, ?, ?)`,
      [userId, dateNaissance || null, telephone || null]
    );
    

    await conn.commit();
    return trouverParId(userId);
  } catch (err) {
    await conn.rollback();
    console.log("❌ Transaction rolled back:", err.message);
    throw err;
  } finally {
    conn.release();
  }
};

const getTicketsByPatient = async (patientId) => {
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

const deleteSession = async (token) => {
  const [result] = await pool.execute(
    'DELETE FROM SESSIONS WHERE token = ?',
    [token]
  );
  return result.affectedRows;
};

const getPatientIdByUserId = async (userId) => {
  const patient = await trouverParId(userId);
  return patient?.patient_id ?? null;
};

// ── Stats dashboard ───────────────────────────────────────────
const getDashboardStats = async (patientId) => {
  // Upcoming appointments (statut planifie ou confirme, date future)
  const [[{ upcoming }]] = await pool.execute(
    `SELECT COUNT(*) AS upcoming
     FROM RENDEZ_VOUS
     WHERE patient_id = ?
       AND statut IN ('planifie', 'confirme')
       AND date_heure > NOW()`,
    [patientId]
  );

  // Active tickets (en_attente ou en_cours)
  const [[{ activeTickets }]] = await pool.execute(
    `SELECT COUNT(*) AS activeTickets
     FROM TICKETS
     WHERE patient_id = ?
       AND statut IN ('en_attente', 'en_cours')`,
    [patientId]
  );

  // Past visits — same logic as getPastByPatient in rendezVousRepository:
  // includes completed ticket consultations as well.
  const [[{ pastVisits }]] = await pool.execute(
    `SELECT COUNT(*) AS pastVisits
     FROM (
       SELECT id FROM RENDEZ_VOUS
       WHERE patient_id = ?
         AND (statut IN ('termine', 'annule') OR date_heure < NOW())
       UNION ALL
       SELECT id FROM TICKETS
       WHERE patient_id = ?
         AND statut = 'termine'
     ) AS history`,
    [patientId, patientId]
  );

  return {
    upcoming:      Number(upcoming),
    activeTickets: Number(activeTickets),
    pastVisits:    Number(pastVisits),
  };
};

// ── Prochain rendez-vous ──────────────────────────────────────
const getNextAppointment = async (patientId) => {
  const [rows] = await pool.execute(
    `SELECT
        r.id         AS rdv_id,
        r.date_heure,
        r.statut,
        r.motif,
        m.id         AS medecin_id,
        u.nom        AS medecin_nom,
        u.prenom     AS medecin_prenom,
        m.specialite,
        m.photo
     FROM RENDEZ_VOUS r
     JOIN MEDECINS m ON m.id  = r.medecin_id
     JOIN USERS    u ON u.id  = m.user_id
     WHERE r.patient_id = ?
       AND r.statut IN ('planifie', 'confirme')
       AND r.date_heure > NOW()
     ORDER BY r.date_heure ASC
     LIMIT 1`,
    [patientId]
  );
  return rows[0] || null;
};

module.exports = {
  trouverParEmail,
  trouverParId,
  creer,
  getTicketsByPatient,
  getDossiersByPatient,
  deleteSession,
  getPatientIdByUserId,
  getDashboardStats,
  getNextAppointment,
};