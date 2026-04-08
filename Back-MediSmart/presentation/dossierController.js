// ============================================================
//  dossierController.js  –  Couche Présentation
//  Sprint 3 – US14 : Accès dossiers patients (médecin)
//  Responsable : Sarra Othmani
// ============================================================

const dossierService    = require('../business/dossierService');
const dossierRepository = require('../repository/dossierRepository');

// ─── GET /api/dossiers/mes-patients ──────────────────────────
const getMesPatients = async (req, res) => {
  try {
    const result = await dossierService.getMesPatients(
      req.utilisateur.user_id
    );

    return res.status(200).json({
      success : true,
      total   : result.total,
      patients: result.patients,
    });

  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }
    console.error('[dossierController.getMesPatients]', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.',
    });
  }
};

// ─── GET /api/dossiers/patient/:patient_id ───────────────────
const getDossierPatient = async (req, res) => {
  try {
    const patient_id = Number(req.params.patient_id);

    if (!patient_id || isNaN(patient_id)) {
      return res.status(400).json({
        success: false,
        message: 'Le paramètre patient_id est requis et doit être un nombre.',
      });
    }

    const dossier = await dossierService.getDossierPatient(
      req.utilisateur.user_id,
      patient_id
    );

    return res.status(200).json({
      success          : true,
      nb_dossiers      : dossier.nb_dossiers,
      nb_rdvs          : dossier.nb_rdvs,
      patient          : dossier.patient,
      dossiers_medicaux: dossier.dossiers_medicaux,
      rendez_vous      : dossier.rendez_vous,
    });

  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }
    console.error('[dossierController.getDossierPatient]', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.',
    });
  }
};

// ─── POST /api/dossiers ──────────────────────────────────────
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

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'patientId est requis.',
      });
    }

    if (!diagnostic && !traitement && !notes) {
      return res.status(400).json({
        success: false,
        message: 'Au moins un champ (diagnostic, traitement, notes) est requis.',
      });
    }

    const dossierId = await dossierRepository.creerDossier({
      patientId : Number(patientId),
      medecinId,
      diagnostic,
      traitement,
      notes,
    });

    return res.status(201).json({
      success   : true,
      message   : 'Dossier médical créé avec succès.',
      dossier_id: dossierId,
    });

  } catch (err) {
    console.error('[dossierController.creerDossier]', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.',
    });
  }
};

// ─── GET /api/dossiers/patient/:patientId/dossiers ───────────
const getDossiersPatient = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId) {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux médecins.',
      });
    }

    const patientId = Number(req.params.patientId);
    if (!patientId || isNaN(patientId)) {
      return res.status(400).json({
        success: false,
        message: 'patientId invalide.',
      });
    }

    // ── Security: ensure this doctor has actually seen this patient ──
    const aUneLiaison = await dossierRepository.verifierRelation(
      medecinId,
      patientId
    );
    if (!aUneLiaison) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous ne pouvez consulter que les dossiers de vos propres patients.',
      });
    }

    const data = await dossierRepository.getDossiersByPatientForMedecin(patientId);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    console.error('[dossierController.getDossiersPatient]', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.',
    });
  }
};

module.exports = {
  getMesPatients,
  getDossierPatient,
  creerDossier,
  getDossiersPatient,
};