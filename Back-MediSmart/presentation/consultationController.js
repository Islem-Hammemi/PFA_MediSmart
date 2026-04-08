// ============================================================
//  presentation/consultationController.js
// ============================================================

const { getTodayQueue } = require('../repository/consultationRepository');

const getTodayQueue_handler = async (req, res) => {
  try {
    const medecin_id = req.utilisateur.medecin_id;
    if (!medecin_id) {
      return res.status(403).json({ success: false, message: 'Accès réservé aux médecins.' });
    }
    const data = await getTodayQueue(medecin_id);
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('[consultationController.getTodayQueue]', err);
    return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
};

module.exports = { getTodayQueue: getTodayQueue_handler };