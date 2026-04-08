const pool                 = require("../config/db");
const patientRepository    = require("../repository/patientRepository");
const rendezVousRepository = require("../repository/rendezVousRepository");

// ─── Helper ───────────────────────────────────────────────────
const _getPatientId = async (userId) => {
  const patientId = await patientRepository.getPatientIdByUserId(userId);
  if (!patientId) throw new Error("Profil patient introuvable.");
  return patientId;
};

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
  if (avecEvaluation) rdv.has_evaluation = Number(row.has_evaluation) === 1;
  return rdv;
};

const _formaterRdvMedecin = (row) => ({
  rdv_id:     row.rdv_id,
  date_heure: row.date_heure,
  statut:     row.statut,
  motif:      row.motif,
  created_at: row.created_at,
  patient: {
    id:         row.patient_id,
    nom:        row.patient_nom,
    prenom:     row.patient_prenom,
    telephone:  row.telephone || null,
  },
});

// ─── Patient services ──────────────────────────────────────────
const getUpcoming = async (userId) => {
  const patientId = await _getPatientId(userId);
  const rows      = await rendezVousRepository.getUpcomingByPatient(patientId);
  return rows.map((row) => _formaterRdv(row));
};

const getPast = async (userId) => {
  const patientId = await _getPatientId(userId);
  const rows      = await rendezVousRepository.getPastByPatient(patientId);
  return rows.map((row) => _formaterRdv(row, true));
};

const annuler = async (rdvId, userId) => {
  const patientId = await _getPatientId(userId);
  const affected  = await rendezVousRepository.annulerRdv(rdvId, patientId);
  if (!affected) throw new Error("RDV introuvable, déjà annulé, ou la date est déjà passée.");
  return { message: "Rendez-vous annulé avec succès." };
};

const reserver = async (userId, { medecinId, dateHeure, motif }) => {
  if (!medecinId || !dateHeure) throw new Error("medecinId et dateHeure sont obligatoires.");
  const patientId = await _getPatientId(userId);
  const id        = await rendezVousRepository.creerRdv({ patientId, medecinId, dateHeure, motif });
  return { id, message: "Rendez-vous créé avec succès." };
};

const getOne = async (rdvId, userId) => {
  const patientId = await _getPatientId(userId);
  const row       = await rendezVousRepository.trouverParIdEtPatient(rdvId, patientId);
  if (!row) throw new Error("Rendez-vous introuvable.");
  return _formaterRdv(row);
};

const getEvaluationEnAttente = async (userId) => {
  const patientId = await _getPatientId(userId);
  return await rendezVousRepository.getEvaluationEnAttente(patientId);
};

const getCreneaux = async (medecinId) => {
  if (!medecinId) throw new Error("medecinId requis.");
  return await rendezVousRepository.getCreneauxDisponibles(medecinId);
};

const reserverViaCreneau = async (userId, { medecinId, creneauId, motif }) => {
  if (!medecinId || !creneauId) throw new Error("medecinId et creneauId sont obligatoires.");
  const patientId  = await _getPatientId(userId);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const creneau = await rendezVousRepository.getCreneauById(creneauId, connection);
    if (!creneau) throw new Error("Créneau introuvable.");
    if (Number(creneau.medecin_id) !== Number(medecinId)) throw new Error("Ce créneau n'appartient pas à ce médecin.");
    if (!creneau.disponible) throw new Error("Ce créneau est déjà réservé. Veuillez en choisir un autre.");
    const dateHeure = creneau.date_heure_debut;
    const conflit   = await rendezVousRepository.checkConflitRdv(medecinId, dateHeure);
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

const getPlanningMedecin = async (medecinId) => {
  if (!medecinId) throw new Error("medecinId requis.");
  const rows = await rendezVousRepository.getPlanningMedecin(medecinId);
  return rows.map(_formaterRdvMedecin);
};

const getUpcomingMedecin = async (medecinId) => {
  if (!medecinId) throw new Error("medecinId requis.");
  const rows = await rendezVousRepository.getUpcomingByMedecin(medecinId);
  return rows.map(_formaterRdvMedecin);
};

// ─── ✅ NOUVEAU : médecin crée un RDV pour un patient ─────────
const reserverParMedecin = async ({ medecinId, patientId, dateHeure, motif, statut }) => {
  if (!medecinId || !patientId || !dateHeure) {
    throw new Error("medecinId, patientId et dateHeure sont obligatoires.");
  }

  // Check for conflicts
  const conflit = await rendezVousRepository.checkConflitRdv(medecinId, dateHeure);
  if (conflit) throw new Error("Conflit : le médecin a déjà un rendez-vous à cet horaire.");

  const [result] = await pool.execute(
    `INSERT INTO RENDEZ_VOUS (patient_id, medecin_id, date_heure, motif, statut)
     VALUES (?, ?, ?, ?, ?)`,
    [patientId, medecinId, dateHeure, motif || null, statut || "confirme"]
  );

  return { id: result.insertId, message: "Rendez-vous créé avec succès." };
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
  reserverParMedecin,   // ✅ nouveau
};