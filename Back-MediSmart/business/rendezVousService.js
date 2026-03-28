// =============================================
// business/rendezVousService.js
// =============================================
const patientRepository   = require("../repository/patientRepository");
const rendezVousRepository = require("../repository/rendezVousRepository");

// ─── Helper : récupérer patient_id depuis user_id ─────────────
const _getPatientId = async (userId) => {
  const patientId = await patientRepository.getPatientIdByUserId(userId);
  if (!patientId) throw new Error("Profil patient introuvable.");
  return patientId;
};

// ─── Formater une ligne RDV ───────────────────────────────────
const _formaterRdv = (row, avecEvaluation = false) => {
  const rdv = {
    rdv_id:     row.rdv_id,
    date_heure: row.date_heure,
    statut:     row.statut,
    motif:      row.motif,
    medecin: {
      id:         row.medecin_id,
      nom:        row.medecin_nom,
      prenom:     row.medecin_prenom,
      specialite: row.specialite,
      photo:      row.photo || null,
    },
  };
  if (avecEvaluation) {
    rdv.has_evaluation = Number(row.has_evaluation) === 1;
  }
  return rdv;
};

// ─── RDV à venir ─────────────────────────────────────────────
const getUpcoming = async (userId) => {
  const patientId = await _getPatientId(userId);
  const rows      = await rendezVousRepository.getUpcomingByPatient(patientId);
  return rows.map((row) => _formaterRdv(row));
};

// ─── RDV passés ──────────────────────────────────────────────
const getPast = async (userId) => {
  const patientId = await _getPatientId(userId);
  const rows      = await rendezVousRepository.getPastByPatient(patientId);
  return rows.map((row) => _formaterRdv(row, true));
};

// ─── Annuler un RDV ──────────────────────────────────────────
const annuler = async (rdvId, userId) => {
  const patientId = await _getPatientId(userId);
  const affected  = await rendezVousRepository.annulerRdv(rdvId, patientId);
  if (!affected) {
    throw new Error("RDV introuvable, déjà annulé, ou la date est déjà passée.");
  }
  return { message: "Rendez-vous annulé avec succès." };
};

// ─── Prendre un RDV ──────────────────────────────────────────
const reserver = async (userId, { medecinId, dateHeure, motif }) => {
  if (!medecinId || !dateHeure) {
    throw new Error("medecinId et dateHeure sont obligatoires.");
  }
  const patientId = await _getPatientId(userId);
  const id        = await rendezVousRepository.creerRdv({
    patientId,
    medecinId,
    dateHeure,
    motif,
  });
  return { id, message: "Rendez-vous créé avec succès." };
};

// ─── Détail d'un RDV ─────────────────────────────────────────
const getOne = async (rdvId, userId) => {
  const patientId = await _getPatientId(userId);
  const row       = await rendezVousRepository.trouverParIdEtPatient(rdvId, patientId);
  if (!row) throw new Error("Rendez-vous introuvable.");
  return _formaterRdv(row);
};

// ─── Évaluation en attente (pour pop-up) ─────────────────────
const getEvaluationEnAttente = async (userId) => {
  const patientId = await _getPatientId(userId);
  return await rendezVousRepository.getEvaluationEnAttente(patientId);
};

module.exports = {
  getUpcoming,
  getPast,
  annuler,
  reserver,
  getOne,
  getEvaluationEnAttente,
};