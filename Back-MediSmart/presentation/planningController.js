// ============================================================
//  planningController.js  –  Couche Présentation
//  Sprint 3 – US13 : Planning médecin
//  Responsable : Sarra Othmani
// ============================================================

const planningService = require('../business/planningService');

const planningController = {

  
   //Retourne le planning complet du médecin connecté.

  async getPlanning(req, res) {
    try {
      const planning = await planningService.getPlanning(
        req.utilisateur.user_id
      );

      return res.status(200).json({
        success: true,
        data: planning,
      });

    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message,
        });
      }
      console.error('[planningController.getPlanning]', err);
      return res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur.',
      });
    }
  },

};

module.exports = planningController;