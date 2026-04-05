// ============================================================
//  dossierService.js  –  Couche Métier (Business)
//  Sprint 3 – US14 : Accès dossiers patients (médecin)
//  Responsable : Sarra Othmani
// ============================================================

const dossierRepository = require('../repository/dossierRepository');

const dossierService = {

  /**
   * Retourne la liste de tous les patients du médecin connecté.
   *
   * @param {number} user_id - depuis req.utilisateur.user_id
   */
  async getMesPatients(user_id) {

    // 1. Récupérer le profil médecin
    const medecin = await dossierRepository.getMedecinByUserId(user_id);
    if (!medecin) {
      const err = new Error('Profil médecin introuvable.');
      err.statusCode = 404;
      throw err;
    }

    // 2. Récupérer la liste des patients
    const patients = await dossierRepository.getMesPatientsListe(
      medecin.medecin_id
    );

    return { patients, total: patients.length };
  },

  /**
   * Retourne le dossier complet d'un patient spécifique.
   * Sécurité : vérifie que le médecin a bien suivi ce patient.
   *
   * @param {number} user_id    - depuis req.utilisateur.user_id
   * @param {number} patient_id - depuis req.params.patient_id
   */
  async getDossierPatient(user_id, patient_id) {

    // 1. Récupérer le profil médecin
    const medecin = await dossierRepository.getMedecinByUserId(user_id);
    if (!medecin) {
      const err = new Error('Profil médecin introuvable.');
      err.statusCode = 404;
      throw err;
    }

    // 2. Vérifier que le médecin a bien suivi ce patient
    const aUneLiaison = await dossierRepository.verifierRelation(
      medecin.medecin_id,
      patient_id
    );
    if (!aUneLiaison) {
      const err = new Error(
        'Accès refusé. Vous ne pouvez consulter que les dossiers de vos propres patients.'
      );
      err.statusCode = 403;
      throw err;
    }

    // 3. Récupérer toutes les données en parallèle
    const [profil, dossiers, rdvs] = await Promise.all([
      dossierRepository.getPatientProfil(patient_id),
      dossierRepository.getDossiersPatient(medecin.medecin_id, patient_id),
      dossierRepository.getRDVPatient(medecin.medecin_id, patient_id),
    ]);

    if (!profil) {
      const err = new Error('Patient introuvable.');
      err.statusCode = 404;
      throw err;
    }

    return {
      patient       : profil,
      dossiers_medicaux: dossiers,
      rendez_vous   : rdvs,
      nb_dossiers   : dossiers.length,
      nb_rdvs       : rdvs.length,
    };
  },

};

module.exports = dossierService;