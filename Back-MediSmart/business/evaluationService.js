// ============================================================
//  evaluationService.js  –  Couche Métier (Business)
//  Sprint 2 – US11 : Évaluation par rendez-vous
//  Sprint 3 – GET évaluations médecin (dashboard + Reviews page)
// ============================================================

const evaluationRepository = require('../repository/evaluationRepository');

const evaluationService = {

  async evaluerMedecin({ patient_id, rendez_vous_id, note, commentaire }) {

    // 1. Vérifier que le RDV existe et appartient au patient
    const rdv = await evaluationRepository.getRendezVousById(rendez_vous_id, patient_id);
    if (!rdv) {
      const err = new Error("Rendez-vous introuvable ou vous n'êtes pas autorisé à évaluer ce rendez-vous.");
      err.statusCode = 404;
      throw err;
    }

    // 2. Vérifier que le RDV est terminé
    if (rdv.statut !== 'termine') {
      const err = new Error(`Vous ne pouvez évaluer qu'un rendez-vous terminé. Statut actuel : "${rdv.statut}".`);
      err.statusCode = 403;
      throw err;
    }

    // 3. Vérifier qu'il n'y a pas déjà une évaluation
    const dejaEvalue = await evaluationRepository.evaluationExistante(rendez_vous_id);
    if (dejaEvalue) {
      const err = new Error('Ce rendez-vous a déjà été évalué. Une seule évaluation par rendez-vous est autorisée.');
      err.statusCode = 409;
      throw err;
    }

    // 4. Valider la note
    if (!Number.isInteger(note) || note < 1 || note > 5) {
      const err = new Error('La note doit être un entier entre 1 et 5.');
      err.statusCode = 400;
      throw err;
    }

    // 5. Enregistrer l'évaluation
    const evaluationId = await evaluationRepository.creerEvaluation({
      patient_id,
      medecin_id: rdv.medecin_id,
      rendez_vous_id,
      note,
      commentaire,
    });

    // 6. Recalculer la note moyenne du médecin
    await evaluationRepository.mettreAJourNoteMoyenne(rdv.medecin_id);

    // 7. FIX : désactiver le flag evaluation_demandee sur le RDV
    await evaluationRepository.desactiverFlag(rendez_vous_id);

    // 8. Retourner les détails complets
    return await evaluationRepository.getEvaluationById(evaluationId);
  },

  /**
   * Retourne les évaluations + stats d'un médecin.
   * FIX : repartition retournée en POURCENTAGES (comme affiché dans Figma img3)
   * Route publique — pas d'auth requise.
   *
   * @param {number} medecin_id
   * @param {number} limit - défaut 10, max 20
   */
  async getEvaluationsMedecin(medecin_id, limit = 10) {

    const safeLimit = Math.min(parseInt(limit, 10) || 10, 20);

    const medecin = await evaluationRepository.getMedecinById(medecin_id);
    if (!medecin) {
      const err = new Error('Médecin introuvable.');
      err.statusCode = 404;
      throw err;
    }

    const [evaluations, stats] = await Promise.all([
      evaluationRepository.getEvaluationsMedecin(medecin_id, safeLimit),
      evaluationRepository.getStatsMedecin(medecin_id),
    ]);

    const total = Number(stats.nb_evaluations) || 0;

    // FIX : calcul des pourcentages côté service (Figma img3 affiche 90%, 14%...)
    const pct = (n) => total > 0 ? Math.round((Number(n) / total) * 100) : 0;

    return {
      medecin,
      stats: {
        note_moyenne  : Number(stats.note_moyenne)   || 0,
        nb_evaluations: total,
        repartition_count: {
          5: Number(stats.nb_5) || 0,
          4: Number(stats.nb_4) || 0,
          3: Number(stats.nb_3) || 0,
          2: Number(stats.nb_2) || 0,
          1: Number(stats.nb_1) || 0,
        },
        repartition_pct: {
          5: pct(stats.nb_5),
          4: pct(stats.nb_4),
          3: pct(stats.nb_3),
          2: pct(stats.nb_2),
          1: pct(stats.nb_1),
        },
      },
      evaluations,
    };
  },

};

module.exports = evaluationService;