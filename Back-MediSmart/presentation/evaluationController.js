// ============================================================
//  evaluationController.js  –  Couche Présentation
//  Sprint 2 – US11 : Évaluation par rendez-vous
//  Responsable : Sarra Othmani
// ============================================================

const evaluationService = require('../business/evaluationService');

const evaluationController = {

  /**
   * POST /api/evaluations
   *
   * Body attendu :
   * {
   *   "rendez_vous_id" : 1,
   *   "note"           : 5,
   *   "commentaire"    : "Très professionnel." (optionnel)
   * }
   *
   * Réponse succès (201) :
   * {
   *   "success": true,
   *   "message": "Évaluation enregistrée avec succès.",
   *   "evaluation": {
   *     "id": 10,
   *     "note": 5,
   *     "commentaire": "Très professionnel.",
   *     "date_evaluation": "19/03/2026 à 14:00",
   *     "date_rendez_vous": "10/03/2026 à 09:00",
   *     "medecin_nom": "Sarra Othmani",
   *     "specialite": "Cardiologie",
   *     "note_moyenne_medecin": 4.75,
   *     "nb_evaluations": 4
   *   }
   * }
   */
  async evaluerMedecin(req, res) {
    try {
      const { rendez_vous_id, note, commentaire } = req.body;

      // ── Validation du body ───────────────────────────────────
      if (!rendez_vous_id || isNaN(Number(rendez_vous_id))) {
        return res.status(400).json({
          success: false,
          message: 'Le champ rendez_vous_id est requis et doit être un nombre.',
        });
      }

      if (note === undefined || note === null) {
        return res.status(400).json({
          success: false,
          message: 'Le champ note est requis (entier entre 1 et 5).',
        });
      }

      // ── Déléguer au service ──────────────────────────────────
      const evaluation = await evaluationService.evaluerMedecin({
        patient_id    : req.utilisateur.patient_id,
        rendez_vous_id: Number(rendez_vous_id),
        note          : Number(note),
        commentaire   : commentaire || null,
      });

      return res.status(201).json({
        success: true,
        message: 'Évaluation enregistrée avec succès.',
        evaluation,
      });

    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message,
        });
      }
      console.error('[evaluationController.evaluerMedecin]', err);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.',
      });
    }
  },

  /**
   * GET /api/evaluations/medecin/:medecin_id
   *
   * Retourne les évaluations récentes + stats d'un médecin.
   * Route publique — pas besoin d'être connecté.
   *
   * Query param optionnel : ?limit=3  (défaut 10, max 20)
   *
   * Réponse (200) :
   * {
   *   "success": true,
   *   "medecin": { "id": 1, "nom": "Sarra Othmani", "specialite": "Cardiologie" },
   *   "stats": {
   *     "note_moyenne": 4.75,
   *     "nb_evaluations": 8,
   *     "repartition": { "5": 5, "4": 2, "3": 1, "2": 0, "1": 0 }
   *   },
   *   "evaluations": [
   *     {
   *       "id": 3,
   *       "note": 5,
   *       "commentaire": "Excellent médecin !",
   *       "date_evaluation": "19/03/2026 à 14:00",
   *       "patient_nom": "Ahmed Ben Ali",
   *       "date_consultation": "10/03/2026"
   *     }
   *   ]
   * }
   */
  async getEvaluationsMedecin(req, res) {
    try {
      const medecin_id = Number(req.params.medecin_id);

      if (!medecin_id || isNaN(medecin_id)) {
        return res.status(400).json({
          success: false,
          message: 'Le paramètre medecin_id est requis et doit être un nombre.',
        });
      }

      const limit = req.query.limit || 10;

      const data = await evaluationService.getEvaluationsMedecin(
        medecin_id,
        limit
      );

      return res.status(200).json({
        success    : true,
        medecin    : data.medecin,
        stats      : data.stats,
        evaluations: data.evaluations,
      });

    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message,
        });
      }
      console.error('[evaluationController.getEvaluationsMedecin]', err);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.',
      });
    }
  },

};

module.exports = evaluationController;