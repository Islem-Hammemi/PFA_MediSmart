// ============================================================
// dossierController.js  – CLEAN FIXED VERSION
// ============================================================

const dossierService = require('../business/dossierService');
const dossierRepository = require('../repository/dossierRepository');


// ─────────────────────────────────────────────
// GET: mes patients
// ─────────────────────────────────────────────
const getMesPatients = async (req, res) => {
  try {
    const result = await dossierService.getMesPatients(
      req.utilisateur.user_id
    );

    return res.status(200).json({
      success: true,
      total: result.total,
      patients: result.patients,
    });

  } catch (err) {
    console.error('[getMesPatients]', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.',
    });
  }
};


// ─────────────────────────────────────────────
// GET: dossier patient
// ─────────────────────────────────────────────
const getDossierPatient = async (req, res) => {
  try {
    const patient_id = Number(req.params.patient_id);

    if (!patient_id || isNaN(patient_id)) {
      return res.status(400).json({
        success: false,
        message: 'patient_id invalide',
      });
    }

    const dossier = await dossierService.getDossierPatient(
      req.utilisateur.user_id,
      patient_id
    );

    return res.status(200).json({
      success: true,
      nb_dossiers: dossier.nb_dossiers,
      nb_rdvs: dossier.nb_rdvs,
      patient: dossier.patient,
      dossiers_medicaux: dossier.dossiers_medicaux,
      rendez_vous: dossier.rendez_vous,
    });

  } catch (err) {
    console.error('[getDossierPatient]', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.',
    });
  }
};


// ─────────────────────────────────────────────
// POST: ajouter patient
// ─────────────────────────────────────────────
const ajouterPatient = async (req, res) => {
  try {
    const result = await dossierService.ajouterPatient(
      req.utilisateur.user_id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: result.message,
      patient_id: result.patient_id,
    });

  } catch (err) {
    console.error('[ajouterPatient]', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.',
    });
  }
};


// ─────────────────────────────────────────────
// POST: créer dossier médical
// ─────────────────────────────────────────────
const creerDossier = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;

    if (!medecinId) {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux médecins.',
      });
    }

    const { patientId, diagnostic, traitement, notes } = req.body;

    const dossierId = await dossierRepository.creerDossier({
      patientId: Number(patientId),
      medecinId,
      diagnostic,
      traitement,
      notes,
    });

    return res.status(201).json({
      success: true,
      dossier_id: dossierId,
    });

  } catch (err) {
    console.error('[creerDossier]', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.',
    });
  }
};


// ─────────────────────────────────────────────
// GET: dossiers patient
// ─────────────────────────────────────────────
const getDossiersPatient = async (req, res) => {
  try {
    const patientId = Number(req.params.patientId);

    if (!patientId || isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: 'patientId invalide',
      });
    }

    const data = await dossierRepository.getDossiersByPatientForMedecin(patientId);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });

  } catch (err) {
    console.error('[getDossiersPatient]', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.',
    });
  }
};


// ─────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────
module.exports = {
  getMesPatients,
  getDossierPatient,
  ajouterPatient,
  creerDossier,
  getDossiersPatient,
};