// ============================================================
//  dossierController.js  –  Couche Présentation
//  Sprint 3 – US14 : Accès dossiers patients (médecin)
//  + US15 : Ajout d'un nouveau patient
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

  /**
   * GET /api/dossiers/mes-patients
   *
   * Retourne la liste de tous les patients du médecin connecté.
   *
   * Réponse (200) :
   * {
   *   "success": true,
   *   "total": 3,
   *   "patients": [
   *     {
   *       "patient_id": 1,
   *       "nom_complet": "Ahmed Ben Ali",
   *       "email": "ahmed@medismart.tn",
   *       "telephone": "55 123 456",
   *       "date_naissance": "1990-05-14",
   *       "nb_rdv": 2,
   *       "dernier_rdv": "10/03/2026 à 09:00"
   *     }
   *   ]
   * }
   */
  async getMesPatients(req, res) {
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
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      console.error('[dossierController.getMesPatients]', err);
      return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
  },

  /**
   * GET /api/dossiers/patient/:patient_id
   *
   * Retourne le dossier complet d'un patient spécifique.
   *
   * Réponse (200) :
   * {
   *   "success": true,
   *   "nb_dossiers": 2,
   *   "nb_rdvs": 3,
   *   "patient": { patient_id, nom_complet, email, telephone, date_naissance },
   *   "dossiers_medicaux": [ { id, date_consultation, diagnostic, traitement, notes } ],
   *   "rendez_vous": [ { id, statut, motif, date_heure } ]
   * }
   */
  async getDossierPatient(req, res) {
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
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      console.error('[dossierController.getDossierPatient]', err);
      return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
  },

  /**
   * POST /api/dossiers/ajouter-patient
   *
   * Crée un nouveau compte patient.
   * Un mot de passe temporaire "Medismart2026!" lui est attribué.
   *
   * Corps (JSON) :
   * {
   *   "prenom": "Rania",
   *   "nom": "Ben Salah",
   *   "email": "rania@example.com",
   *   "telephone": "55 000 111",       ← optionnel
   *   "date_naissance": "1995-08-20"   ← optionnel  (format YYYY-MM-DD)
   * }
   *
   * Réponse (201) :
   * {
   *   "success": true,
   *   "message": "Patient créé avec succès.",
   *   "patient_id": 7
   * }
   */
  async ajouterPatient(req, res) {
    try {
      const result = await dossierService.ajouterPatient(
        req.utilisateur.user_id,
        req.body
      );

      return res.status(201).json({
        success   : true,
        message   : result.message,
        patient_id: result.patient_id,
      });

    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      console.error('[dossierController.ajouterPatient]', err);
      return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
    }
  },

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