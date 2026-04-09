// ============================================================
//  consultationService.js  –  Couche Métier
//  Sprint 3 – Smart Consultation
// ============================================================
const consultationRepository = require('../repository/consultationRepository');
const medecinRepository      = require('../repository/medecinRepository');

const consultationService = {

  /**
   * Sauvegarder les notes d'une consultation terminée.
   * Le médecin saisit diagnostic, traitement, notes → créé dans DOSSIERS_MEDICAUX.
   *
   * Règles métier :
   *  1. Le RDV doit exister et appartenir au médecin connecté.
   *  2. Le RDV doit être en statut 'confirme' ou 'termine'.
   *  3. diagnostic, traitement, notes sont tous optionnels mais au moins un requis.
   *
   * @param {number} user_id       - depuis req.utilisateur.user_id
   * @param {number} rdv_id        - id du rendez-vous
   * @param {string} diagnostic    - optionnel
   * @param {string} traitement    - optionnel
   * @param {string} notes         - notes libres du médecin
   */
  async sauvegarderNotes({ user_id, rdv_id, diagnostic, traitement, notes }) {

    // 1. Récupérer le medecin_id depuis user_id
    const medecin = await medecinRepository.trouverParId(user_id);
    if (!medecin) {
      const err = new Error('Profil médecin introuvable.');
      err.statusCode = 404;
      throw err;
    }

    // 2. Vérifier que le RDV existe et appartient au médecin
    const rdv = await consultationRepository.getRdvMedecin(rdv_id, medecin.medecin_id);
    if (!rdv) {
      const err = new Error('Rendez-vous introuvable ou accès non autorisé.');
      err.statusCode = 404;
      throw err;
    }

    // 3. Vérifier statut valide
    if (!['confirme', 'termine'].includes(rdv.statut)) {
      const err = new Error(`Impossible d'ajouter des notes : statut RDV "${rdv.statut}" invalide.`);
      err.statusCode = 403;
      throw err;
    }

    // 4. Au moins un champ requis
    if (!diagnostic && !traitement && !notes) {
      const err = new Error('Au moins un champ parmi diagnostic, traitement ou notes est requis.');
      err.statusCode = 400;
      throw err;
    }

    // 5. Créer le dossier médical
    const dossier_id = await consultationRepository.creerDossier({
      medecin_id        : medecin.medecin_id,
      patient_id        : rdv.patient_id,
      date_consultation : rdv.date_heure,
      diagnostic,
      traitement,
      notes,
    });

    return await consultationRepository.getDossierById(dossier_id);
  },

};

module.exports = consultationService;