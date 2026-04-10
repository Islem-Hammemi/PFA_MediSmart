// =============================================
// business/rendezVousService.js — MERGED CLEAN
// =============================================

const pool                 = require("../config/db");
const patientRepository    = require("../repository/patientRepository");
const rendezVousRepository = require("../repository/rendezVousRepository");

// ─── Helper ───────────────────────────────────
const _getPatientId = async (userId) => {
  const patientId = await patientRepository.getPatientIdByUserId(userId);
  if (!patientId) {
    const err = new Error("Profil patient introuvable.");
    err.statusCode = 404;
    throw err;
  }
  return patientId;
};

// ─── Formatter patient ────────────────────────
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

// ─── Formatter médecin ────────────────────────
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

// ══════════════════════════════════════════════
// PATIENT
// ══════════════════════════════════════════════

const getUpcoming = async (userId) => {
  const patientId = await _getPatientId(userId);
  const rows = await rendezVousRepository.getUpcomingByPatient(patientId);
  return rows.map(_formaterRdvPatient);
};

const getPast = async (userId) => {
  const patientId = await _getPatientId(userId);
  const rows = await rendezVousRepository.getPastByPatient(patientId);
  return rows.map(r => _formaterRdvPatient(r, true));
};

const annuler = async (rdvId, userId) => {
  const patientId = await _getPatientId(userId);
  const affected  = await rendezVousRepository.annulerRdv(rdvId, patientId);
  if (!affected) throw new Error("RDV introuvable ou déjà annulé.");
  return { message: "Rendez-vous annulé avec succès." };
};

const reserver = async (userId, { medecinId, dateHeure, motif }) => {
  if (!medecinId || !dateHeure)
    throw new Error("medecinId et dateHeure sont obligatoires.");

  const patientId = await _getPatientId(userId);

  // ✅ important (Sarra)
  const conflitPatient = await rendezVousRepository.verifierConflitPatient(patientId, dateHeure);
  if (conflitPatient)
    throw new Error("Vous avez déjà un RDV à cette date.");

  const conflitMedecin = await rendezVousRepository.verifierConflitMedecin(medecinId, dateHeure);
  if (conflitMedecin)
    throw new Error("Médecin indisponible.");

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
  return rendezVousRepository.getEvaluationEnAttente(patientId);
};

// ══════════════════════════════════════════════
// CRÉNEAUX
// ══════════════════════════════════════════════

const getCreneaux = async (medecinId) => {
  if (!medecinId) throw new Error("medecinId requis.");
  return rendezVousRepository.getCreneauxDisponibles(medecinId);
};

const reserverViaCreneau = async (userId, { medecinId, creneauId, motif }) => {
  if (!medecinId || !creneauId)
    throw new Error("medecinId et creneauId obligatoires.");

  const patientId  = await _getPatientId(userId);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const creneau = await rendezVousRepository.getCreneauById(creneauId, connection);
    if (!creneau) throw new Error("Créneau introuvable.");
    if (!creneau.disponible) throw new Error("Créneau déjà réservé.");

    const { date_heure_debut: dateHeure } = creneau;

    const rdvId = await rendezVousRepository.creerRdvAvecConnexion(
      { patientId, medecinId, dateHeure, motif }, connection
    );

    await rendezVousRepository.marquerCreneauIndisponible(creneauId, connection);
    await connection.commit();

    return { rdv_id: rdvId, date_heure: dateHeure };

  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

// ══════════════════════════════════════════════
// MÉDECIN
// ══════════════════════════════════════════════

const getPlanningMedecin = async (medecinId) => {
  const rows = await rendezVousRepository.getPlanningMedecin(medecinId);
  return rows.map(_formaterRdvMedecin);
};

const getUpcomingMedecin = async (medecinId) => {
  const rows = await rendezVousRepository.getUpcomingByMedecin(medecinId);
  return rows.map(_formaterRdvMedecin);
};

const getPendingMedecin = async (medecinId) => {
  const rows = await rendezVousRepository.getPendingByMedecin(medecinId);
  return rows.map(_formaterRdvMedecin);
};

// ✅ YOUR FEATURE (better than separate ones)
const changerStatut = async (rdvId, medecinId, nouveauStatut, statutsAutorisés) => {
  const affected = await rendezVousRepository.changerStatutRdv(
    rdvId, medecinId, nouveauStatut, statutsAutorisés
  );
  if (!affected) throw new Error("Action non autorisée.");
  return { message: `Statut mis à jour : ${nouveauStatut}` };
};

// ✅ YOUR FEATURE
const reserverParMedecin = async ({ medecinId, patientId, dateHeure, motif }) => {
  const [result] = await pool.execute(
    `INSERT INTO RENDEZ_VOUS (patient_id, medecin_id, date_heure, motif)
     VALUES (?, ?, ?, ?)`,
    [patientId, medecinId, dateHeure, motif || null]
  );
  return { id: result.insertId };
};

module.exports = {
  getUpcoming,
  getPast,
  annuler,
  reserver,
  getOne,
  getEvaluationEnAttente,
  getCreneaux,
  reserverViaCreneau,
  getPlanningMedecin,
  getUpcomingMedecin,
  getPendingMedecin,
  changerStatut,
  reserverParMedecin,
};