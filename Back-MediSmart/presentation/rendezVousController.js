// =============================================
// presentation/rendezVousController.js
// =============================================
const rendezVousService = require("../business/rendezVousService");

// ─── GET /api/rendez-vous/upcoming ───────────────────────────
const getUpcoming = async (req, res) => {
  try {
    // req.utilisateur vient de authMiddleware (comme dans ton projet)
    const data = await rendezVousService.getUpcoming(req.utilisateur.user_id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/rendez-vous/past ───────────────────────────────
const getPast = async (req, res) => {
  try {
    const data = await rendezVousService.getPast(req.utilisateur.user_id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/rendez-vous/:id ────────────────────────────────
const getOne = async (req, res) => {
  try {
    const data = await rendezVousService.getOne(
      Number(req.params.id),
      req.utilisateur.user_id
    );
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

// ─── POST /api/rendez-vous ───────────────────────────────────
// Body : { medecinId, dateHeure, motif? }
const reserver = async (req, res) => {
  try {
    const result = await rendezVousService.reserver(
      req.utilisateur.user_id,
      req.body
    );
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/rendez-vous/:id/annuler ──────────────────────
const annuler = async (req, res) => {
  try {
    const result = await rendezVousService.annuler(
      Number(req.params.id),
      req.utilisateur.user_id
    );
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── GET /api/rendez-vous/evaluation-pending ─────────────────
// Vérifie si une pop-up d'évaluation doit s'afficher
const getEvaluationEnAttente = async (req, res) => {
  try {
    const data = await rendezVousService.getEvaluationEnAttente(
      req.utilisateur.user_id
    );
    // data = null  → pas de pop-up
    // data = {...} → afficher la pop-up
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getUpcoming,
  getPast,
  getOne,
  reserver,
  annuler,
  getEvaluationEnAttente,
};