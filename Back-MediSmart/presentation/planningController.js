// ============================================================
//  presentation/planningController.js
// ============================================================
const planningService = require('../business/planningService');
const { sendError }   = require('../middleware/errorHandler');

const planningController = {
  async getPlanning(req, res) {
    try {
      const planning = await planningService.getPlanning(req.utilisateur.user_id);
      return res.status(200).json({ success: true, data: planning });
    } catch (err) { return sendError(res, err); }
  },
};

module.exports = planningController;