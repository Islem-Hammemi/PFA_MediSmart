// ============================================================
//  dossierService.js  –  Couche Métier (Business)
//  Sprint 3 – US14 : Accès dossiers patients (médecin)
//  + US15 : Ajout d'un nouveau patient par le médecin
//  Responsable : Sarra Othmani
// ============================================================

const dossierRepository = require('../repository/dossierRepository');

const dossierService = {

  /**
   * Retourne la liste de tous les patients du médecin connecté.
   */
  async getMesPatients(user_id) {
    const medecin = await dossierRepository.getMedecinByUserId(user_id);
    if (!medecin) {
      const err = new Error('Profil médecin introuvable.');
      err.statusCode = 404;
      throw err;
    }

    const patients = await dossierRepository.getMesPatientsListe(medecin.medecin_id);
    return { patients, total: patients.length };
  },

  /**
   * Retourne le dossier complet d'un patient spécifique.
   * Sécurité : vérifie que le médecin a bien suivi ce patient.
   */
  async getDossierPatient(user_id, patient_id) {
    const medecin = await dossierRepository.getMedecinByUserId(user_id);
    if (!medecin) {
      const err = new Error('Profil médecin introuvable.');
      err.statusCode = 404;
      throw err;
    }

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
      patient          : profil,
      dossiers_medicaux: dossiers,
      rendez_vous      : rdvs,
      nb_dossiers      : dossiers.length,
      nb_rdvs          : rdvs.length,
    };
  },

  /**
   * Crée un nouveau compte patient.
   * Le médecin peut enregistrer un patient directement depuis son interface.
   *
   * @param {number} user_id - médecin connecté (pour vérifier son existence)
   * @param {object} data    - { prenom, nom, email, date_naissance?, telephone? }
   */
  async ajouterPatient(user_id, data) {
    // 1. Vérifier que le médecin existe
    const medecin = await dossierRepository.getMedecinByUserId(user_id);
    if (!medecin) {
      const err = new Error('Profil médecin introuvable.');
      err.statusCode = 404;
      throw err;
    }

    // 2. Validation des champs obligatoires
    const { prenom, nom, email } = data;
    if (!prenom?.trim() || !nom?.trim() || !email?.trim()) {
      const err = new Error('Les champs prénom, nom et email sont obligatoires.');
      err.statusCode = 400;
      throw err;
    }

    // 3. Vérifier unicité de l'email
    const existe = await dossierRepository.emailExiste(email.trim().toLowerCase());
    if (existe) {
      const err = new Error('Un compte avec cet email existe déjà.');
      err.statusCode = 409;
      throw err;
    }

    // 4. Créer le patient
    const patient_id = await dossierRepository.creerPatient({
      prenom       : prenom.trim(),
      nom          : nom.trim(),
      email        : email.trim().toLowerCase(),
      date_naissance: data.date_naissance || null,
      telephone    : data.telephone?.trim() || null,
    });

    return { patient_id, message: 'Patient créé avec succès.' };
  },

};

module.exports = dossierService;