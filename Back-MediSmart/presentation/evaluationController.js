const evaluationService = require('../business/evaluationService');

const evaluationController = {

  
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

};

module.exports = evaluationController;