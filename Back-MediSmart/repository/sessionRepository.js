// =============================================
// repository/sessionRepository.js
// Accès MySQL – Table SESSIONS
// Stockage des tokens JWT en base (US7)
// =============================================
const pool   = require("../config/db");
const crypto = require("crypto"); // module natif Node.js, aucune installation requise

// ── Utilitaire : hacher le token JWT en SHA-256 (64 chars) ──────────────────
// Le JWT brut peut dépasser VARCHAR(255) – on stocke son hash à la place
const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// ── Sauvegarder un token en base ─────────────────────────────────────────────
const sauvegarder = async (userId, token, expiresAt) => {
  // Supprimer les anciennes sessions de l'utilisateur (1 session active à la fois)
  await pool.execute(
    "DELETE FROM SESSIONS WHERE user_id = ?",
    [userId]
  );

  await pool.execute(
    `INSERT INTO SESSIONS (user_id, token, expires_at)
     VALUES (?, ?, ?)`,
    [userId, hashToken(token), expiresAt]
  );
};

// ── Vérifier qu'un token existe et n'est pas expiré ─────────────────────────
const verifier = async (token) => {
  const [rows] = await pool.execute(
    `SELECT * FROM SESSIONS
     WHERE token = ? AND expires_at > NOW()
     LIMIT 1`,
    [hashToken(token)]
  );
  return rows[0] || null;
};

// ── Supprimer un token (déconnexion) ─────────────────────────────────────────
const supprimer = async (token) => {
  await pool.execute(
    "DELETE FROM SESSIONS WHERE token = ?",
    [hashToken(token)]
  );
};

// ── Supprimer tous les tokens d'un utilisateur ──────────────────────────────
const supprimerTous = async (userId) => {
  await pool.execute(
    "DELETE FROM SESSIONS WHERE user_id = ?",
    [userId]
  );
};

module.exports = {
  sauvegarder,
  verifier,
  supprimer,
  supprimerTous,
};