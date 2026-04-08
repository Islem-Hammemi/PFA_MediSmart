// =============================================
// business/rendezVousService.js  — VERSION FINALE SPRINT 3
// =============================================
const pool                  = require("../config/db");
const patientRepository     = require("../repository/patientRepository");
const rendezVousRepository  = require("../repository/rendezVousRepository");

const _getPatientId = async (userId) => {
  const patientId = await patientRepository.getPatientIdByUserId(userId);
  if (!patientId) throw new Error("Profil patient introuvable.");
  return patientId;
};

const _formaterRdvPatient = (row, avecEvaluation = false) => {
  const rdv = {
    rdv_id: row.rdv_id, date_heure: row.date_heure,
    statut: row.statut, motif: row.motif,
    medecin: {
      id: row.medecin_id, nom: row.medecin_nom,
      prenom: row.medecin_prenom, specialite: row.specialite, photo: row.photo || null,
    },
  };
  if (avecEvaluation) rdv.has_evaluation = Number(row.has_evaluation) === 1;
  return rdv;
};

const _formaterRdvMedecin = (row) => ({
  rdv_id: row.rdv_id, date_heure: row.date_heure,
  statut: row.statut, motif: row.motif, created_at: row.created_at,
  patient: {
    id: row.patient_id, nom: row.patient_nom,
    prenom: row.patient_prenom, telephone: row.telephone || null,
  },
});

// ── Patient ───────────────────────────────────────────────────
const getUpcoming = async (userId) => {
  const patientId = await _getPatientId(userId);
  return (await rendezVousRepository.getUpcomingByPatient(patientId)).map(r => _formaterRdvPatient(r));
};

const getPast = async (userId) => {
  const patientId = await _getPatientId(userId);
  return (await rendezVousRepository.getPastByPatient(patientId)).map(r => _formaterRdvPatient(r, true));
};

const annuler = async (rdvId, userId) => {
  const patientId = await _getPatientId(userId);
  const affected = await rendezVousRepository.annulerRdv(rdvId, patientId);
  if (!affected) throw new Error("RDV introuvable, déjà annulé, ou la date est déjà passée.");
  return { message: "Rendez-vous annulé avec succès." };
};

const reserver = async (userId, { medecinId, dateHeure, motif }) => {
  if (!medecinId || !dateHeure) throw new Error("medecinId et dateHeure sont obligatoires.");
  const patientId = await _getPatientId(userId);
  const id = await rendezVousRepository.creerRdv({ patientId, medecinId, dateHeure, motif });
  return { id, message: "Rendez-vous créé avec succès." };
};

const getOne = async (rdvId, userId) => {
  const patientId = await _getPatientId(userId);
  const row = await rendezVousRepository.trouverParIdEtPatient(rdvId, patientId);
  if (!row) throw new Error("Rendez-vous introuvable.");
  return _formaterRdvPatient(row);
};

const getEvaluationEnAttente = async (userId) => {
  const patientId = await _getPatientId(userId);
  return await rendezVousRepository.getEvaluationEnAttente(patientId);
};

// ── Créneaux ─────────────────────────────────────────────────
const getCreneaux = async (medecinId) => {
  if (!medecinId) throw new Error("medecinId requis.");
  return await rendezVousRepository.getCreneauxDisponibles(medecinId);
};

const reserverViaCreneau = async (userId, { medecinId, creneauId, motif }) => {
  if (!medecinId || !creneauId) throw new Error("medecinId et creneauId sont obligatoires.");
  const patientId = await _getPatientId(userId);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const creneau = await rendezVousRepository.getCreneauById(creneauId, connection);
    if (!creneau) throw new Error("Créneau introuvable.");
    if (Number(creneau.medecin_id) !== Number(medecinId)) throw new Error("Ce créneau n'appartient pas à ce médecin.");
    if (!creneau.disponible) throw new Error("Ce créneau est déjà réservé.");
    const dateHeure = creneau.date_heure_debut;
    const conflit = await rendezVousRepository.checkConflitRdv(medecinId, dateHeure);
    if (conflit) throw new Error("Conflit détecté : le médecin a déjà un rendez-vous à cet horaire.");
    const rdvId = await rendezVousRepository.creerRdvAvecConnexion({ patientId, medecinId, dateHeure, motif }, connection);
    await rendezVousRepository.marquerCreneauIndisponible(creneauId, connection);
    await connection.commit();
    return { success: true, rdv_id: rdvId, date_heure: dateHeure, message: "Rendez-vous réservé avec succès." };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

// ── Médecin ───────────────────────────────────────────────────
const getPlanningMedecin = async (medecinId) => {
  if (!medecinId) throw new Error("medecinId requis.");
  return (await rendezVousRepository.getPlanningMedecin(medecinId)).map(_formaterRdvMedecin);
};

const getUpcomingMedecin = async (medecinId) => {
  if (!medecinId) throw new Error("medecinId requis.");
  return (await rendezVousRepository.getUpcomingByMedecin(medecinId)).map(_formaterRdvMedecin);
};

// ─── [NOUVEAU] Pending requests ──────────────────────────────
const getPendingMedecin = async (medecinId) => {
  if (!medecinId) throw new Error("medecinId requis.");
  return (await rendezVousRepository.getPendingByMedecin(medecinId)).map(_formaterRdvMedecin);
};

// ─── [NOUVEAU] Confirmer un RDV ──────────────────────────────
const confirmer = async (rdvId, medecinId) => {
  if (!medecinId) throw new Error("Accès réservé aux médecins.");
  const affected = await rendezVousRepository.confirmerRdv(rdvId, medecinId);
  if (!affected) throw new Error("RDV introuvable ou déjà confirmé.");
  return { message: "Rendez-vous confirmé avec succès." };
};

// ─── [NOUVEAU] Refuser un RDV ────────────────────────────────
const refuser = async (rdvId, medecinId) => {
  if (!medecinId) throw new Error("Accès réservé aux médecins.");
  const affected = await rendezVousRepository.refuserRdv(rdvId, medecinId);
  if (!affected) throw new Error("RDV introuvable ou déjà annulé.");
  return { message: "Rendez-vous refusé avec succès." };
};

// ─── [NOUVEAU] Terminer une consultation ─────────────────────
const terminer = async (rdvId, medecinId) => {
  if (!medecinId) throw new Error("Accès réservé aux médecins.");
  const affected = await rendezVousRepository.terminerConsultation(rdvId, medecinId);
  if (!affected) throw new Error("RDV introuvable ou pas en statut 'confirme'.");
  return { message: "Consultation terminée avec succès." };
};

module.exports = {
  getUpcoming, getPast, annuler, reserver, getOne, getEvaluationEnAttente,
  getCreneaux, reserverViaCreneau,
  getPlanningMedecin, getUpcomingMedecin,
  getPendingMedecin, confirmer, refuser, terminer,
};