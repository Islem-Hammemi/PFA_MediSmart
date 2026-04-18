// ============================================================
//  repository/consultationRepository.js
//  FIXED — Sprint 3
//  Corrections :
//   1. Ajout de getRdvMedecin()  — utilisé par consultationService
//   2. Ajout de creerDossier()   — utilisé par consultationService
//   3. Ajout de getDossierById() — utilisé par consultationService
// ============================================================

const db = require('../config/db');

// ─── File du jour (RDV + Tickets fusionnés) ──────────────────
/**
 * Retourne la file du jour pour un médecin :
 * - Patients avec RDV aujourd'hui (planifie/confirme)
 * - Patients avec ticket actif (en_attente/en_cours)
 * Triés intelligemment : entre deux RDV, les tickets s'insèrent
 */
const getTodayQueue = async (medecin_id) => {

  // ── 1. RDV du jour ────────────────────────────────────────
  const [rdvs] = await db.query(
    `SELECT
       r.id                                              AS source_id,
       'rdv'                                             AS source_type,
       r.id                                              AS rdv_id,
       r.statut                                          AS rdv_statut,
       r.motif,
       r.date_heure                                      AS heure_prevue,
       TIME_FORMAT(r.date_heure, '%H:%i')               AS heure_affichee,
       pa.id                                             AS patient_id,
       CONCAT(u.prenom, ' ', u.nom)                      AS patient_nom,
       pa.telephone,
       u.email,
       NULL                                              AS ticket_numero,
       NULL                                              AS ticket_position
     FROM RENDEZ_VOUS r
     JOIN PATIENTS pa ON pa.id = r.patient_id
     JOIN USERS    u  ON u.id  = pa.user_id
     WHERE r.medecin_id = ?
       AND DATE(r.date_heure) = CURDATE()
       AND r.statut IN ('planifie', 'confirme')
     ORDER BY r.date_heure ASC`,
    [medecin_id]
  );

  // ── 2. Tickets actifs du jour ─────────────────────────────
  const [tickets] = await db.query(
    `SELECT
       t.id                                              AS source_id,
       'ticket'                                          AS source_type,
       NULL                                              AS rdv_id,
       NULL                                              AS rdv_statut,
       NULL                                              AS motif,
       t.created_at                                      AS heure_prevue,
       TIME_FORMAT(t.created_at, '%H:%i')               AS heure_affichee,
       pa.id                                             AS patient_id,
       CONCAT(u.prenom, ' ', u.nom)                      AS patient_nom,
       pa.telephone,
       u.email,
       t.numero                                          AS ticket_numero,
       t.position                                        AS ticket_position,
       t.statut                                          AS ticket_statut,
       CASE WHEN t.statut = 'en_cours' THEN UNIX_TIMESTAMP(t.updated_at) END AS started_at
     FROM TICKETS t
     JOIN PATIENTS pa ON pa.id = t.patient_id
     JOIN USERS    u  ON u.id  = pa.user_id
     WHERE t.medecin_id = ?
       AND DATE(t.created_at) = CURDATE()
       AND t.statut IN ('en_attente', 'en_cours')
     ORDER BY t.position ASC`,
    [medecin_id]
  );

  // ── 3. Fusion intelligente ────────────────────────────────
  // Règle : un patient qui a un RDV aujourd'hui ET un ticket
  // → on garde l'entrée RDV (plus précise), on retire le ticket doublon
  const rdvPatientIds = new Set(rdvs.map(r => r.patient_id));
  const ticketsFiltres = tickets.filter(t => !rdvPatientIds.has(t.patient_id));

  // ── 4. Tri intercalé ──────────────────────────────────────
  const result = [];
  let ticketIdx = 0;
  const sortedTickets = [...ticketsFiltres].sort(
    (a, b) => new Date(a.heure_prevue) - new Date(b.heure_prevue)
  );

  for (let i = 0; i < rdvs.length; i++) {
    const rdvTime = new Date(rdvs[i].heure_prevue);

    // Insérer tous les tickets arrivés AVANT ce RDV
    while (
      ticketIdx < sortedTickets.length &&
      new Date(sortedTickets[ticketIdx].heure_prevue) <= rdvTime
    ) {
      result.push({ ...sortedTickets[ticketIdx], ordre: result.length });
      ticketIdx++;
    }

    result.push({ ...rdvs[i], ordre: result.length });
  }

  // Tickets restants (après tous les RDV)
  while (ticketIdx < sortedTickets.length) {
    result.push({ ...sortedTickets[ticketIdx], ordre: result.length });
    ticketIdx++;
  }

  // ── 5. Patient "en_cours" en premier ──────────────────────
  const enCours = result.filter(
    r => r.ticket_statut === 'en_cours' || r.rdv_statut === 'en_cours'
  );
  const reste = result.filter(
    r => r.ticket_statut !== 'en_cours' && r.rdv_statut !== 'en_cours'
  );

  return [...enCours, ...reste].map((item, idx) => ({
    ...item,
    ordre: idx + 1,
  }));
};

// ─── Vérifier qu'un RDV appartient bien au médecin ───────────
/**
 * FIX : cette fonction était appelée dans consultationService.sauvegarderNotes
 * mais n'existait pas dans le repository → erreur runtime "getRdvMedecin is not a function"
 *
 * @param {number} rdv_id
 * @param {number} medecin_id
 * @returns {object|null} ligne RDV ou null
 */
const getRdvMedecin = async (rdv_id, medecin_id) => {
  const [rows] = await db.query(
    `SELECT id AS rdv_id, patient_id, date_heure, statut, motif
     FROM RENDEZ_VOUS
     WHERE id = ? AND medecin_id = ?
     LIMIT 1`,
    [rdv_id, medecin_id]
  );
  return rows[0] || null;
};

// ─── Créer un dossier médical ─────────────────────────────────
/**
 * FIX : utilisé par consultationService.sauvegarderNotes mais absent.
 *
 * @returns {number} dossier_id (insertId)
 */
const creerDossier = async ({ medecin_id, patient_id, date_consultation, diagnostic, traitement, notes }) => {
  const [result] = await db.query(
    `INSERT INTO DOSSIERS_MEDICAUX
       (medecin_id, patient_id, date_consultation, diagnostic, traitement, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      medecin_id,
      patient_id,
      date_consultation,
      diagnostic || null,
      traitement || null,
      notes      || null,
    ]
  );
  return result.insertId;
};

// ─── Récupérer un dossier par son ID ─────────────────────────
/**
 * FIX : utilisé par consultationService après creerDossier mais absent.
 *
 * @param {number} dossier_id
 * @returns {object|null}
 */
const getDossierById = async (dossier_id) => {
  const [rows] = await db.query(
    `SELECT
       d.id              AS dossier_id,
       d.medecin_id,
       d.patient_id,
       d.date_consultation,
       d.diagnostic,
       d.traitement,
       d.notes,
       d.duration,
       d.created_at,
       CONCAT(um.prenom, ' ', um.nom) AS medecin_nom,
       CONCAT(up.prenom, ' ', up.nom) AS patient_nom
     FROM DOSSIERS_MEDICAUX d
     JOIN MEDECINS me ON me.id    = d.medecin_id
     JOIN USERS    um ON um.id    = me.user_id
     JOIN PATIENTS pa ON pa.id    = d.patient_id
     JOIN USERS    up ON up.id    = pa.user_id
     WHERE d.id = ?
     LIMIT 1`,
    [dossier_id]
  );
  return rows[0] || null;
};

// ─── Obtenir la durée moyenne de consultation pour un médecin ──
/**
 * Calcule la durée moyenne des consultations récentes pour un médecin.
 * Utilise les 10 dernières consultations avec durée > 0.
 *
 * @param {number} medecin_id
 * @returns {number} durée moyenne en minutes (défaut 4 si pas de données)
 */
const getAverageConsultationTime = async (medecin_id) => {
  const [rows] = await db.query(
    `SELECT AVG(duration) AS avg_duration
     FROM DOSSIERS_MEDICAUX
     WHERE medecin_id = ? AND duration > 0
     ORDER BY created_at DESC
     LIMIT 10`,
    [medecin_id]
  );
  const avgSeconds = rows[0]?.avg_duration || 0;
  return avgSeconds > 0 ? Math.ceil(avgSeconds / 60) : 4; // minutes, default 4
};

module.exports = {
  getTodayQueue,
  getRdvMedecin,   // ← NOUVEAU
  creerDossier,    // ← NOUVEAU
  getDossierById,  // ← NOUVEAU
  getAverageConsultationTime, // ← NOUVEAU
};