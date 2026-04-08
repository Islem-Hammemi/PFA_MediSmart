// ============================================================
//  repository/consultationRepository.js
//  File fusionnée du jour : tickets + RDV triés par heure
// ============================================================

const db = require('../config/db');

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
       t.statut                                          AS ticket_statut
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
  // On intercale les tickets entre les RDV selon l'heure d'arrivée.
  // Un ticket "entre" juste avant le prochain RDV dont l'heure n'est pas encore passée.
  //
  // Algorithme :
  // - Parcourir les RDV triés par heure
  // - Pour chaque "trou" entre deux RDV, insérer les tickets arrivés dans ce créneau
  // - Les tickets arrivés avant le 1er RDV passent en premier
  // - Les tickets arrivés après le dernier RDV passent en dernier

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

    // Ajouter le RDV
    result.push({ ...rdvs[i], ordre: result.length });
  }

  // Ajouter les tickets restants (après tous les RDV)
  while (ticketIdx < sortedTickets.length) {
    result.push({ ...sortedTickets[ticketIdx], ordre: result.length });
    ticketIdx++;
  }

  // ── 5. Mettre le patient "en_cours" en premier ────────────
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

module.exports = { getTodayQueue };