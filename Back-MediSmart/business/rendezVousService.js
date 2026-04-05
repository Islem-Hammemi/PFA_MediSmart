const pool                 = require("../config/db");
const patientRepository    = require("../repository/patientRepository");
const rendezVousRepository = require("../repository/rendezVousRepository");

// ─── Helper : récupérer patient_id depuis user_id ─────────────
const _getPatientId = async (userId) => {
  const patientId = await patientRepository.getPatientIdByUserId(userId);
  if (!patientId) throw new Error("Profil patient introuvable.");
  return patientId;
};

// ─── Formater une ligne RDV patient ──────────────────────────
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

// ─── Formater une ligne RDV médecin ──────────────────────────
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



// ─── RDV à venir (patient) ───────────────────────────────────
const getUpcoming = async (userId) => {
  const patientId = await _getPatientId(userId);
  const rows      = await rendezVousRepository.getUpcomingByPatient(patientId);
  return rows.map((row) => _formaterRdv(row));
};

// ─── RDV passés (patient) ────────────────────────────────────
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

// ─── Réserver un RDV simple (sans créneau) ───────────────────
// Gardé pour compatibilité — le frontend peut envoyer juste medecinId+dateHeure
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

// ─── Évaluation en attente (pop-up) ──────────────────────────
const getEvaluationEnAttente = async (userId) => {
  const patientId = await _getPatientId(userId);
  return await rendezVousRepository.getEvaluationEnAttente(patientId);
};



// ─── Créneaux disponibles d'un médecin ───────────────────────
// US17
const getCreneaux = async (medecinId) => {
  if (!medecinId) throw new Error("medecinId requis.");
  return await rendezVousRepository.getCreneauxDisponibles(medecinId);
};

// ─── Réserver via créneau (avec transaction + validation) ────
// US18 – version sécurisée avec transaction MySQL
// Body attendu : { medecinId, creneauId, motif? }
const reserverViaCreneau = async (userId, { medecinId, creneauId, motif }) => {
  if (!medecinId || !creneauId) {
    throw new Error("medecinId et creneauId sont obligatoires.");
  }

  const patientId = await _getPatientId(userId);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Verrouiller et lire le créneau (FOR UPDATE → évite double réservation)
    const creneau = await rendezVousRepository.getCreneauById(creneauId, connection);

    if (!creneau) {
      throw new Error("Créneau introuvable.");
    }
    if (Number(creneau.medecin_id) !== Number(medecinId)) {
      throw new Error("Ce créneau n'appartient pas à ce médecin.");
    }
    if (!creneau.disponible) {
      throw new Error("Ce créneau est déjà réservé. Veuillez en choisir un autre.");
    }

    const dateHeure = creneau.date_heure_debut;

    // 2. Double vérification : conflit RDV existant sur le médecin
    const conflit = await rendezVousRepository.checkConflitRdv(medecinId, dateHeure);
    if (conflit) {
      throw new Error("Conflit détecté : le médecin a déjà un rendez-vous à cet horaire.");
    }

    // 3. Créer le RDV
    const rdvId = await rendezVousRepository.creerRdvAvecConnexion(
      { patientId, medecinId, dateHeure, motif },
      connection
    );

    // 4. Bloquer le créneau
    await rendezVousRepository.marquerCreneauIndisponible(creneauId, connection);

    await connection.commit();

    return {
      success: true,
      rdv_id: rdvId,
      date_heure: dateHeure,
      message: "Rendez-vous réservé avec succès.",
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

// ─── Planning complet du médecin connecté ────────────────────
// US13
const getPlanningMedecin = async (medecinId) => {
  if (!medecinId) throw new Error("medecinId requis.");
  const rows = await rendezVousRepository.getPlanningMedecin(medecinId);
  return rows.map(_formaterRdvMedecin);
};

// ─── Prochains RDV du médecin connecté ───────────────────────
// US19
const getUpcomingMedecin = async (medecinId) => {
  if (!medecinId) throw new Error("medecinId requis.");
  const rows = await rendezVousRepository.getUpcomingByMedecin(medecinId);
  return rows.map(_formaterRdvMedecin);
};

module.exports = {

  getUpcoming,
  getPast,
  annuler,
  reserver,
  getOne,
  getEvaluationEnAttente,
  // ── Nouveaux Sprint 3 – Backend 1 ──
  getCreneaux,
  reserverViaCreneau,
  getPlanningMedecin,
  getUpcomingMedecin,
};