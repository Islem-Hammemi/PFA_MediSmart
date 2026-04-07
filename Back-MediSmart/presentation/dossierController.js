// ============================================================
//  dossierController.js  –  Couche Présentation
//  Sprint 3 – US14 : Accès dossiers patients (médecin)
//  Responsable : Sarra Othmani
// ============================================================

const dossierService = require('../business/dossierService');

const dossierController = {

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
   *       "date_naissance": "14/05/1990",
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
        success: true,
        total  : result.total,
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

      // Validation du paramètre
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
        success     : true,
        nb_dossiers : dossier.nb_dossiers,
        nb_rdvs     : dossier.nb_rdvs,
        patient     : dossier.patient,
        dossiers_medicaux: dossier.dossiers_medicaux,
        rendez_vous : dossier.rendez_vous,
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
  },

};

module.exports = dossierController;