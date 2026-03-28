// ============================================================
//  evaluationService.js  –  Couche Métier (Business)
//  Sprint 2 – US11 : Évaluation par rendez-vous
//  Responsable : Sarra Othmani
// ============================================================

const evaluationRepository = require('../repository/evaluationRepository');

const evaluationService = {

  /**
   * Enregistre une évaluation liée à un rendez-vous terminé.
   *
   * Règles métier :
   *  1. Le rendez-vous doit exister ET appartenir au patient connecté.
   *  2. Le rendez-vous doit avoir le statut 'termine'.
   *  3. Ce rendez-vous ne doit pas déjà avoir une évaluation.
   *  4. La note doit être un entier entre 1 et 5.
   *  5. Après insertion → recalcul de la note moyenne du médecin.
   *
   * @param {number} patient_id      - depuis req.utilisateur.patient_id
   * @param {number} rendez_vous_id  - id du rendez-vous à évaluer
   * @param {number} note            - entier entre 1 et 5
   * @param {string} commentaire     - optionnel
   */
  async evaluerMedecin({ patient_id, rendez_vous_id, note, commentaire }) {

    // ── 1. Vérifier que le rendez-vous existe et appartient au patient ──
    const rdv = await evaluationRepository.getRendezVousById(
      rendez_vous_id,
      patient_id
    );

    if (!rdv) {
      const err = new Error(
        'Rendez-vous introuvable ou vous n\'êtes pas autorisé à évaluer ce rendez-vous.'
      );
      err.statusCode = 404;
      throw err;
    }

    // ── 2. Vérifier que le rendez-vous est terminé ──────────────────────
    if (rdv.statut !== 'termine') {
      const err = new Error(
        `Vous ne pouvez évaluer qu'un rendez-vous terminé. Statut actuel : "${rdv.statut}".`
      );
      err.statusCode = 403;
      throw err;
    }

    // ── 3. Vérifier qu'il n'y a pas déjà une évaluation ────────────────
    const dejaEvalue = await evaluationRepository.evaluationExistante(rendez_vous_id);
    if (dejaEvalue) {
      const err = new Error(
        `Ce rendez-vous a déjà été évalué. Une seule évaluation par rendez-vous est autorisée.`
      );
      err.statusCode = 409;
      throw err;
    }

    // ── 4. Valider la note ──────────────────────────────────────────────
    if (!Number.isInteger(note) || note < 1 || note > 5) {
      const err = new Error('La note doit être un entier entre 1 et 5.');
      err.statusCode = 400;
      throw err;
    }

    // ── 5. Enregistrer l'évaluation ─────────────────────────────────────
    const evaluationId = await evaluationRepository.creerEvaluation({
      patient_id,
      medecin_id : rdv.medecin_id,  // récupéré depuis le rendez-vous
      rendez_vous_id,
      note,
      commentaire,
    });

    // ── 6. Recalculer la note moyenne du médecin ────────────────────────
    await evaluationRepository.mettreAJourNoteMoyenne(rdv.medecin_id);
    await evaluationRepository.desactiverFlag(rendez_vous_id);

    // ── 7. Retourner les détails complets ───────────────────────────────
    return await evaluationRepository.getEvaluationById(evaluationId);
  },

};

module.exports = evaluationService;