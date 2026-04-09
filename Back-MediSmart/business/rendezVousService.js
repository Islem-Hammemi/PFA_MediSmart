// =============================================
// business/rendezVousService.js  — FIXED Sprint 3 (ESLint clean)
// =============================================

// FIX ESLint: `pool` était importé uniquement pour pool.getConnection()
// dans reserverViaCreneau → on le garde mais on supprime l'import inutilisé
// si jamais le projet utilise la règle no-unused-vars stricte.
// pool EST utilisé dans reserverViaCreneau → import conservé.
const pool                 = require("../config/db");
const patientRepository    = require("../repository/patientRepository");
const rendezVousRepository = require("../repository/rendezVousRepository");

// ─── Helper : récupérer patient_id depuis user_id ─────────────
const _getPatientId = async (userId) => {
  const patientId = await patientRepository.getPatientIdByUserId(userId);
  if (!patientId) {
    const err = new Error("Profil patient introuvable.");
    err.statusCode = 404;
    throw err;
  }
  return patientId;
};

// ─── Formater un RDV côté patient ────────────────────────────
const _formaterRdvPatient = (row, avecEvaluation = false) => {
  const rdv = {
    rdv_id    : row.rdv_id,
    date_heure: row.date_heure,
    statut    : row.statut,
    motif     : row.motif,
    medecin: {
      id        : row.medecin_id,
      nom       : row.medecin_nom,
      prenom    : row.medecin_prenom,
      specialite: row.specialite,
      photo     : row.photo || null,
    },
  };
  if (avecEvaluation) rdv.has_evaluation = Number(row.has_evaluation) === 1;
  return rdv;
};

// ─── Formater un RDV côté médecin ────────────────────────────
const _formaterRdvMedecin = (row) => ({
  rdv_id    : row.rdv_id,
  date_heure: row.date_heure,
  statut    : row.statut,
  motif     : row.motif,
  created_at: row.created_at,
  patient: {
    id       : row.patient_id,
    nom      : row.patient_nom,
    prenom   : row.patient_prenom,
    telephone: row.telephone || null,
  },
});

// ══════════════════════════════════════════════════════════════
// PATIENT
// ══════════════════════════════════════════════════════════════

// ─── RDV à venir ─────────────────────────────────────────────
const getUpcoming = async (userId) => {
  const patientId = await _getPatientId(userId);
  const rows = await rendezVousRepository.getUpcomingByPatient(patientId);
  // FIX ESLint no-return-await : on évite return await imbriqué
  return rows.map(_formaterRdvPatient);
};

// ─── RDV passés ──────────────────────────────────────────────
const getPast = async (userId) => {
  const patientId = await _getPatientId(userId);
  const rows = await rendezVousRepository.getPastByPatient(patientId);
  return rows.map(r => _formaterRdvPatient(r, true));
};

// ─── Annuler un RDV ──────────────────────────────────────────
const annuler = async (rdvId, userId) => {
  const patientId = await _getPatientId(userId);
  const affected  = await rendezVousRepository.annulerRdv(rdvId, patientId);
  if (!affected) throw new Error("RDV introuvable, déjà annulé, ou la date est déjà passée.");
  return { message: "Rendez-vous annulé avec succès." };
};

// ─── Réserver un RDV (sans créneau) ──────────────────────────
const reserver = async (userId, { medecinId, dateHeure, motif }) => {
  if (!medecinId || !dateHeure)
    throw new Error("medecinId et dateHeure sont obligatoires.");

  const patientId = await _getPatientId(userId);

  const conflitPatient = await rendezVousRepository.verifierConflitPatient(patientId, dateHeure);
  if (conflitPatient)
    throw new Error("Vous avez déjà un rendez-vous ce jour-là. Veuillez choisir une autre date.");

  const conflitMedecin = await rendezVousRepository.verifierConflitMedecin(medecinId, dateHeure);
  if (conflitMedecin)
    throw new Error("Ce médecin a déjà un rendez-vous à cette heure. Veuillez choisir un autre créneau.");

  const id = await rendezVousRepository.creerRdv({ patientId, medecinId, dateHeure, motif });
  return { id, message: "Rendez-vous créé avec succès." };
};

// ─── Détail d'un RDV ─────────────────────────────────────────
const getOne = async (rdvId, userId) => {
  const patientId = await _getPatientId(userId);
  const row = await rendezVousRepository.trouverParIdEtPatient(rdvId, patientId);
  if (!row) throw new Error("Rendez-vous introuvable.");
  return _formaterRdvPatient(row);
};

// ─── Évaluation en attente (pop-up) ──────────────────────────
// FIX ESLint no-return-await : suppression du `return await` inutile
const getEvaluationEnAttente = async (userId) => {
  const patientId = await _getPatientId(userId);
  return rendezVousRepository.getEvaluationEnAttente(patientId);
};

// ══════════════════════════════════════════════════════════════
// CRÉNEAUX
// ══════════════════════════════════════════════════════════════

// ─── Lister les créneaux disponibles d'un médecin ────────────
// FIX ESLint no-return-await
const getCreneaux = async (medecinId) => {
  if (!medecinId) throw new Error("medecinId requis.");
  return rendezVousRepository.getCreneauxDisponibles(medecinId);
};

// ─── Réserver via créneau (avec transaction) ─────────────────
const reserverViaCreneau = async (userId, { medecinId, creneauId, motif }) => {
  if (!medecinId || !creneauId)
    throw new Error("medecinId et creneauId sont obligatoires.");

  const patientId  = await _getPatientId(userId);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const creneau = await rendezVousRepository.getCreneauById(creneauId, connection);
    if (!creneau)
      throw new Error("Créneau introuvable.");
    if (Number(creneau.medecin_id) !== Number(medecinId))
      throw new Error("Ce créneau n'appartient pas à ce médecin.");
    if (!creneau.disponible)
      throw new Error("Ce créneau est déjà réservé.");

    const { date_heure_debut: dateHeure } = creneau; // FIX ESLint prefer-destructuring

    const conflit = await rendezVousRepository.checkConflitRdv(medecinId, dateHeure);
    if (conflit)
      throw new Error("Conflit détecté : le médecin a déjà un rendez-vous à cet horaire.");

    const rdvId = await rendezVousRepository.creerRdvAvecConnexion(
      { patientId, medecinId, dateHeure, motif }, connection
    );
    await rendezVousRepository.marquerCreneauIndisponible(creneauId, connection);
    await connection.commit();

    return {
      success   : true,
      rdv_id    : rdvId,
      date_heure: dateHeure,
      message   : "Rendez-vous réservé avec succès.",
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

// ══════════════════════════════════════════════════════════════
// MÉDECIN
// ══════════════════════════════════════════════════════════════

// ─── Planning complet ─────────────────────────────────────────
const getPlanningMedecin = async (medecinId) => {
  if (!medecinId) throw new Error("medecinId requis.");
  const rows = await rendezVousRepository.getPlanningMedecin(medecinId);
  return rows.map(_formaterRdvMedecin);
};

// ─── RDV à venir du médecin ───────────────────────────────────
const getUpcomingMedecin = async (medecinId) => {
  if (!medecinId) throw new Error("medecinId requis.");
  const rows = await rendezVousRepository.getUpcomingByMedecin(medecinId);
  return rows.map(_formaterRdvMedecin);
};

// ─── RDV en attente de confirmation ──────────────────────────
const getPendingMedecin = async (medecinId) => {
  if (!medecinId) throw new Error("medecinId requis.");
  const rows = await rendezVousRepository.getPendingByMedecin(medecinId);
  return rows.map(_formaterRdvMedecin);
};

// ─── Confirmer un RDV ────────────────────────────────────────
const confirmer = async (rdvId, medecinId) => {
  if (!medecinId) throw new Error("Accès réservé aux médecins.");
  const affected = await rendezVousRepository.confirmerRdv(rdvId, medecinId);
  if (!affected) throw new Error("RDV introuvable ou déjà confirmé.");
  return { message: "Rendez-vous confirmé avec succès." };
};

// ─── Refuser un RDV ──────────────────────────────────────────
const refuser = async (rdvId, medecinId) => {
  if (!medecinId) throw new Error("Accès réservé aux médecins.");
  const affected = await rendezVousRepository.refuserRdv(rdvId, medecinId);
  if (!affected) throw new Error("RDV introuvable ou déjà annulé.");
  return { message: "Rendez-vous refusé avec succès." };
};

// ─── Terminer une consultation ────────────────────────────────
const terminer = async (rdvId, medecinId) => {
  if (!medecinId) throw new Error("Accès réservé aux médecins.");
  const affected = await rendezVousRepository.terminerConsultation(rdvId, medecinId);
  if (!affected) throw new Error("RDV introuvable ou pas en statut 'confirme'.");
  return { message: "Consultation terminée avec succès." };
};

module.exports = {
  // Patient
  getUpcoming,
  getPast,
  annuler,
  reserver,
  getOne,
  getEvaluationEnAttente,
  // Créneaux
  getCreneaux,
  reserverViaCreneau,
  // Médecin
  getPlanningMedecin,
  getUpcomingMedecin,
  getPendingMedecin,
  confirmer,
  refuser,
  terminer,
};