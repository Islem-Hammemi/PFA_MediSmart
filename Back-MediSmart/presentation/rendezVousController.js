// =============================================
// presentation/rendezVousController.js  — VERSION FINALE SPRINT 3
// =============================================
const rendezVousService = require("../business/rendezVousService");

// ── Patient ───────────────────────────────────────────────────
const getUpcoming = async (req, res) => {
  try {
    const data = await rendezVousService.getUpcoming(req.utilisateur.user_id);
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getPast = async (req, res) => {
  try {
    const data = await rendezVousService.getPast(req.utilisateur.user_id);
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getOne = async (req, res) => {
  try {
    const data = await rendezVousService.getOne(Number(req.params.id), req.utilisateur.user_id);
    res.json({ success: true, data });
  } catch (err) { res.status(404).json({ success: false, message: err.message }); }
};

const reserver = async (req, res) => {
  try {
    const result = await rendezVousService.reserver(req.utilisateur.user_id, req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

const annuler = async (req, res) => {
  try {
    const result = await rendezVousService.annuler(Number(req.params.id), req.utilisateur.user_id);
    res.json({ success: true, ...result });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

const getEvaluationEnAttente = async (req, res) => {
  try {
    const data = await rendezVousService.getEvaluationEnAttente(req.utilisateur.user_id);
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Créneaux ─────────────────────────────────────────────────
const getCreneaux = async (req, res) => {
  try {
    const medecinId = Number(req.params.medecinId);
    if (!medecinId || isNaN(medecinId))
      return res.status(400).json({ success: false, message: "medecinId invalide." });
    const data = await rendezVousService.getCreneaux(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const reserverViaCreneau = async (req, res) => {
  try {
    const { medecinId, creneauId, motif } = req.body;
    if (!medecinId || !creneauId)
      return res.status(400).json({ success: false, message: "medecinId et creneauId sont requis." });
    const result = await rendezVousService.reserverViaCreneau(
      req.utilisateur.user_id, { medecinId: Number(medecinId), creneauId: Number(creneauId), motif }
    );
    res.status(201).json(result);
  } catch (err) {
    const status = err.message.includes("déjà réservé") || err.message.includes("Conflit") ? 409 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

// ── Médecin ───────────────────────────────────────────────────
const getPlanningMedecin = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId) return res.status(403).json({ success: false, message: "Accès réservé aux médecins." });
    const data = await rendezVousService.getPlanningMedecin(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getUpcomingMedecin = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId) return res.status(403).json({ success: false, message: "Accès réservé aux médecins." });
    const data = await rendezVousService.getUpcomingMedecin(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── [NOUVEAU] Pending requests ──────────────────────────────
const getPendingMedecin = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId) return res.status(403).json({ success: false, message: "Accès réservé aux médecins." });
    const data = await rendezVousService.getPendingMedecin(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ─── [NOUVEAU] Confirmer un RDV ──────────────────────────────
const confirmer = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    const result = await rendezVousService.confirmer(Number(req.params.id), medecinId);
    res.json({ success: true, ...result });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

// ─── [NOUVEAU] Refuser un RDV ────────────────────────────────
const refuser = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    const result = await rendezVousService.refuser(Number(req.params.id), medecinId);
    res.json({ success: true, ...result });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

// ─── [NOUVEAU] Terminer une consultation ─────────────────────
const terminer = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    const result = await rendezVousService.terminer(Number(req.params.id), medecinId);
    res.json({ success: true, ...result });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

module.exports = {
  getUpcoming, getPast, getOne, reserver, annuler, getEvaluationEnAttente,
  getCreneaux, reserverViaCreneau,
  getPlanningMedecin, getUpcomingMedecin,
  getPendingMedecin, confirmer, refuser, terminer,
};