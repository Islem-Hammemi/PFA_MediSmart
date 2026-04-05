// ============================================================
//  planningService.js  –  Couche Métier (Business)
//  Sprint 3 – US13 : Planning médecin
//  Responsable : Sarra Othmani
// ============================================================

const planningRepository = require('../repository/planningRepository');

const planningService = {

  /**
   * Retourne le planning complet du médecin connecté :
   *  - Informations du médecin
   *  - RDV à venir (upcoming)
   *  - RDV passés (past)
   *  - Créneaux disponibles
   *  - Statistiques
   *
   * @param {number} user_id - depuis req.utilisateur.user_id (session médecin)
   */
  async getPlanning(user_id) {

    // 1. Récupérer le profil médecin
    const medecin = await planningRepository.getMedecinByUserId(user_id);
    if (!medecin) {
      const err = new Error('Profil médecin introuvable.');
      err.statusCode = 404;
      throw err;
    }

    // 2. Récupérer toutes les données en parallèle
    const [rdv_a_venir, rdv_passes, creneaux, stats] = await Promise.all([
      planningRepository.getUpcomingRDV(medecin.medecin_id),
      planningRepository.getPastRDV(medecin.medecin_id),
      planningRepository.getCreneaux(medecin.medecin_id),
      planningRepository.getStats(medecin.medecin_id),
    ]);

    // 3. Construire la réponse
    return {
      medecin: {
        id          : medecin.medecin_id,
        nom         : medecin.nom,
        prenom      : medecin.prenom,
        email       : medecin.email,
        specialite  : medecin.specialite,
        statut      : medecin.statut,
        note_moyenne: medecin.note_moyenne,
        nb_evaluations: medecin.nb_evaluations,
      },
      stats,
      rdv_a_venir,
      rdv_passes,
      creneaux,
    };
  },

};

module.exports = planningService;