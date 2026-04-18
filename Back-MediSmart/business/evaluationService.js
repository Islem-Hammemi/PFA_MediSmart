// ============================================================
//  evaluationService.js  –  Couche Métier (Business)
//  Sprint 2 – US11 : Évaluation par rendez-vous
//  Sprint 3 – GET évaluations médecin (dashboard + Reviews page)
// ============================================================

const evaluationRepository = require('../repository/evaluationRepository');
const evaluationService = {
// business/evaluationService.js
async evaluerMedecin({ patient_id, rendez_vous_id, medecin_id, ticket_id, note, commentaire }) {
  //                                                              ↑ add this

  if (!patient_id) {
    const err = new Error('patient_id requis.');
    err.statusCode = 400;
    throw err;
  }

  if (!Number.isInteger(note) || note < 1 || note > 5) {
    const err = new Error('La note doit être un entier entre 1 et 5.');
    err.statusCode = 400;
    throw err;
  }

  let resolvedMedecinId = medecin_id;

  if (rendez_vous_id) {
    const rdv = await evaluationRepository.getRendezVousById(rendez_vous_id, patient_id);
    if (!rdv) {
      const err = new Error("Rendez-vous introuvable.");
      err.statusCode = 404;
      throw err;
    }
    if (rdv.statut !== 'termine') {
      const err = new Error(`RDV pas encore terminé. Statut: "${rdv.statut}".`);
      err.statusCode = 403;
      throw err;
    }
    const dejaEvalue = await evaluationRepository.evaluationExistante(rendez_vous_id);
    if (dejaEvalue) {
      const err = new Error('Ce rendez-vous a déjà été évalué.');
      err.statusCode = 409;
      throw err;
    }
    resolvedMedecinId = rdv.medecin_id;
  }

  if (!resolvedMedecinId) {
    const err = new Error('medecin_id requis.');
    err.statusCode = 400;
    throw err;
  }

  const evaluationId = await evaluationRepository.creerEvaluation({
    patient_id,
    medecin_id:     resolvedMedecinId,
    rendez_vous_id: rendez_vous_id || null,
    ticket_id:      ticket_id      || null,  //  add this
    note,
    commentaire,
  });

  await evaluationRepository.mettreAJourNoteMoyenne(resolvedMedecinId);

  if (rendez_vous_id) {
    await evaluationRepository.desactiverFlag(rendez_vous_id);
  }

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