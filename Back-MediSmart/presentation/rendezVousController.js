// ============================================================
//  rendezVousController.js
// ============================================================
const rendezVousService = require("../business/rendezVousService");

// ─── GET /api/rendez-vous/upcoming (patient) ─────────────────
const getUpcoming = async (req, res) => {
  try {
    const data = await rendezVousService.getUpcoming(req.utilisateur.user_id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/rendez-vous/past (patient) ─────────────────────
const getPast = async (req, res) => {
  try {
    const data = await rendezVousService.getPast(req.utilisateur.user_id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/rendez-vous/:id (patient) ──────────────────────
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

// ─── POST /api/rendez-vous (patient) ─────────────────────────
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

// ─── PATCH /api/rendez-vous/:id/annuler (patient) ────────────
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

// ─── GET /api/rendez-vous/evaluation-pending (patient) ───────
const getEvaluationEnAttente = async (req, res) => {
  try {
    const data = await rendezVousService.getEvaluationEnAttente(
      req.utilisateur.user_id
    );
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/rendez-vous/creneaux/:medecinId (patient) ──────
const getCreneaux = async (req, res) => {
  try {
    const medecinId = Number(req.params.medecinId);
    if (!medecinId || isNaN(medecinId))
      return res.status(400).json({ success: false, message: "medecinId invalide." });
    const data = await rendezVousService.getCreneaux(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/rendez-vous/creneau (patient) ─────────────────
const reserverViaCreneau = async (req, res) => {
  try {
    const { medecinId, creneauId, motif } = req.body;
    if (!medecinId || !creneauId)
      return res.status(400).json({ success: false, message: "medecinId et creneauId sont requis." });
    const result = await rendezVousService.reserverViaCreneau(
      req.utilisateur.user_id,
      { medecinId: Number(medecinId), creneauId: Number(creneauId), motif }
    );
    res.status(201).json(result);
  } catch (err) {
    const status = err.message.includes("déjà réservé") || err.message.includes("Conflit") ? 409 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

// ─── GET /api/rendez-vous/medecin/planning ───────────────────
const getPlanningMedecin = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Accès réservé aux médecins." });
    const data = await rendezVousService.getPlanningMedecin(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/rendez-vous/medecin/upcoming ───────────────────
const getUpcomingMedecin = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Accès réservé aux médecins." });
    const data = await rendezVousService.getUpcomingMedecin(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/rendez-vous/medecin/pending ────────────────────
// Returns all RDVs with statut = 'planifie' for this doctor
const getPendingMedecin = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Accès réservé aux médecins." });
    const data = await rendezVousService.getPendingMedecin(medecinId);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/rendez-vous/:id/confirmer ────────────────────
const confirmer = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Accès réservé aux médecins." });
    const result = await rendezVousService.changerStatut(
      Number(req.params.id),
      medecinId,
      "confirme",
      ["planifie"]
    );
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/rendez-vous/:id/refuser ──────────────────────
const refuser = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Accès réservé aux médecins." });
    const result = await rendezVousService.changerStatut(
      Number(req.params.id),
      medecinId,
      "annule",
      ["planifie", "confirme"]
    );
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── PATCH /api/rendez-vous/:id/terminer ─────────────────────
const terminer = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Accès réservé aux médecins." });
    const result = await rendezVousService.changerStatut(
      Number(req.params.id),
      medecinId,
      "termine",
      ["confirme"]
    );
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── POST /api/rendez-vous/medecin/reserver ──────────────────
const reserverParMedecin = async (req, res) => {
  try {
    const medecinId = req.utilisateur.medecin_id;
    if (!medecinId)
      return res.status(403).json({ success: false, message: "Accès réservé aux médecins." });
    const { patientId, dateHeure, motif, statut } = req.body;
    if (!patientId || !dateHeure)
      return res.status(400).json({ success: false, message: "patientId et dateHeure sont requis." });
    const result = await rendezVousService.reserverParMedecin({
      medecinId,
      patientId: Number(patientId),
      dateHeure,
      motif,
      statut: statut || "confirme",
    });
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getUpcoming,
  getPast,
  getOne,
  reserver,
  annuler,
  getEvaluationEnAttente,
  getCreneaux,
  reserverViaCreneau,
  getPlanningMedecin,
  getUpcomingMedecin,
  getPendingMedecin,
  confirmer,
  refuser,
  terminer,
  reserverParMedecin,
};