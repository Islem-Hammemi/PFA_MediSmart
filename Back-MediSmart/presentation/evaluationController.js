// ============================================================
//  presentation/evaluationController.js
// ============================================================
const evaluationService = require('../business/evaluationService');
const { sendError }     = require('../middleware/errorHandler');

const evaluationController = {

  async evaluerMedecin(req, res) {
    try {
      const { rendez_vous_id, medecin_id, ticket_id, note, commentaire } = req.body;
      if (!rendez_vous_id && !medecin_id && !ticket_id)
        return res.status(400).json({ success: false, message: "Please specify the appointment or ticket to review." });
      if (note === undefined || note === null)
        return res.status(400).json({ success: false, message: "A rating (1–5) is required." });
      const evaluation = await evaluationService.evaluerMedecin({
        patient_id:     req.utilisateur.patient_id,
        rendez_vous_id: rendez_vous_id ? Number(rendez_vous_id) : null,
        medecin_id:     medecin_id     ? Number(medecin_id)     : null,
        ticket_id:      ticket_id      ? Number(ticket_id)      : null,
        note:           Number(note),
        commentaire:    commentaire || null,
      });
      return res.status(201).json({ success: true, message: "Review submitted successfully.", evaluation });
    } catch (err) { return sendError(res, err); }
  },

  async getEvaluationsMedecin(req, res) {
    try {
      const medecin_id = Number(req.params.medecin_id);
      if (!medecin_id || isNaN(medecin_id))
        return res.status(400).json({ success: false, message: "Invalid doctor ID." });
      const data = await evaluationService.getEvaluationsMedecin(medecin_id, req.query.limit || 10);
      return res.status(200).json({ success: true, medecin: data.medecin, stats: data.stats, evaluations: data.evaluations });
    } catch (err) { return sendError(res, err); }
  },
};

module.exports = evaluationController;