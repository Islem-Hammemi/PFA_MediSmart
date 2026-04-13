// =============================================
// presentation/rendezVousController.js
// =============================================
const rendezVousService = require("../business/rendezVousService");
const { sendError }     = require("../middleware/errorHandler");

// ── PATIENT ──────────────────────────────────────────────────

const getUpcoming = async (req, res) => {
  try {
    const data = await rendezVousService.getUpcoming(req.utilisateur.user_id);
    res.json({ success: true, data });
  } catch (err) { return sendError(res, err); }
};

const getPast = async (req, res) => {
  try {
    const data = await rendezVousService.getPast(req.utilisateur.user_id);
    res.json({ success: true, data });
  } catch (err) { return sendError(res, err); }
};

const getOne = async (req, res) => {
  try {
    const data = await rendezVousService.getOne(Number(req.params.id), req.utilisateur.user_id);
    res.json({ success: true, data });
  } catch (err) { return sendError(res, err); }
};

const reserver = async (req, res) => {
  try {
    const result = await rendezVousService.reserver(req.utilisateur.user_id, req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err) { return sendError(res, err); }
};

const annuler = async (req, res) => {
  try {
    const result = await rendezVousService.annuler(Number(req.params.id), req.utilisateur.user_id);
    res.json({ success: true, ...result });
  } catch (err) { return sendError(res, err); }
};

const getEvaluationEnAttente = async (req, res) => {
  try {
    const data = await rendezVousService.getEvaluationEnAttente(req.utilisateur.user_id);
    res.json({ success: true, data });
  } catch (err) { return sendError(res, err); }
};

// ── CRÉNEAUX ─────────────────────────────────────────────────

const getCreneaux = async (req, res) => {
  try {
    const medecinId = Number(req.params.medecinId);
    if (!medecinId || isNaN(medecinId))
      return res.status(400).json({ success: false, message: "Invalid doctor ID." });
    const data = await rendezVousService.getCreneaux(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) { return sendError(res, err); }
};

const reserverViaCreneau = async (req, res) => {
  try {
    const { medecinId, creneauId, motif } = req.body;
    if (!medecinId || !creneauId)
      return res.status(400).json({ success: false, message: "Doctor and time slot are required." });
    const result = await rendezVousService.reserverViaCreneau(
      req.utilisateur.user_id,
      { medecinId: Number(medecinId), creneauId: Number(creneauId), motif }
    );
    res.status(201).json(result);
  } catch (err) { return sendError(res, err); }
};

// ── MÉDECIN ──────────────────────────────────────────────────

const getPlanningMedecin = async (req, res) => {
  try {
    const { medecin_id: medecinId } = req.utilisateur;
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Access reserved for doctors." });
    const data = await rendezVousService.getPlanningMedecin(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) { return sendError(res, err); }
};

const getUpcomingMedecin = async (req, res) => {
  try {
    const { medecin_id: medecinId } = req.utilisateur;
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Access reserved for doctors." });
    const data = await rendezVousService.getUpcomingMedecin(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) { return sendError(res, err); }
};

const getPendingMedecin = async (req, res) => {
  try {
    const { medecin_id: medecinId } = req.utilisateur;
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Access reserved for doctors." });
    const data = await rendezVousService.getPendingMedecin(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) { return sendError(res, err); }
};

const confirmer = async (req, res) => {
  try {
    const result = await rendezVousService.changerStatut(
      Number(req.params.id), req.utilisateur.medecin_id, "confirme", ["planifie"]
    );
    res.json({ success: true, ...result });
  } catch (err) { return sendError(res, err); }
};

const refuser = async (req, res) => {
  try {
    const result = await rendezVousService.changerStatut(
      Number(req.params.id), req.utilisateur.medecin_id, "annule", ["planifie", "confirme"]
    );
    res.json({ success: true, ...result });
  } catch (err) { return sendError(res, err); }
};

const terminer = async (req, res) => {
  try {
    const result = await rendezVousService.changerStatut(
      Number(req.params.id), req.utilisateur.medecin_id, "termine", ["confirme"]
    );
    res.json({ success: true, ...result });
  } catch (err) { return sendError(res, err); }
};

const reserverParMedecin = async (req, res) => {
  try {
    const { medecin_id: medecinId } = req.utilisateur;
    const { patientId, dateHeure, motif } = req.body;
    const result = await rendezVousService.reserverParMedecin({
      medecinId, patientId: Number(patientId), dateHeure, motif,
    });
    res.status(201).json({ success: true, ...result });
  } catch (err) { return sendError(res, err); }
};

module.exports = {
  getUpcoming, getPast, getOne, reserver, annuler, getEvaluationEnAttente,
  getCreneaux, reserverViaCreneau,
  getPlanningMedecin, getUpcomingMedecin, getPendingMedecin,
  confirmer, refuser, terminer, reserverParMedecin,
};